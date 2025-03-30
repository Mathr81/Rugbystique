const { Streamer, Utils, prepareStream, playStream } = require("@dank074/discord-video-stream");
const { Client, StageChannel } = require('discord.js-selfbot-v13');
const { executablePath } = require('puppeteer');
const { launch, getStream } = require('puppeteer-stream');
const puppeteer = require('puppeteer-extra');
const AdblockerPlugin = require('puppeteer-extra-plugin-adblocker');
const StealthPlugin = require('puppeteer-extra-plugin-stealth');
const AnonymizeUaPlugin = require('puppeteer-extra-plugin-anonymize-ua');
const fs = require('fs');
const path = require('path');

const { DEFAULT_INTERCEPT_RESOLUTION_PRIORITY } = puppeteer;
puppeteer.use(AdblockerPlugin({ interceptResolutionPriority: DEFAULT_INTERCEPT_RESOLUTION_PRIORITY }));
puppeteer.use(StealthPlugin());
puppeteer.use(AnonymizeUaPlugin());

const streamer = new Streamer(new Client());

streamer.client.on("ready", async () => {
    console.log(`[UserBot] => Ready as ${streamer.client.user.tag}`);
});

async function loadUserBot() {
    streamer.client.login(process.env.STREAM_USER_TOKEN);
    return streamer;
};

async function streamPuppeteer(tvchannel, streamer, opts, cancelSignal) {
    if (cancelSignal?.aborted) {
        throw new Error("Operation aborted");
    }
    cancelSignal?.addEventListener("abort", () => {
        browser.close();
    }, { once: true });
    browser = await launch({
        defaultViewport: {
            width: opts.width,
            height: opts.height,
        },
        args: [
            "--no-sandbox",
            '--disable-dev-shm-usage',
            `--proxy-server=${process.env.VPN_SERVER}`
        ],
        executablePath: executablePath(),
        headless: "new"
    });

    const page = await browser.newPage();

    await page.authenticate({
        username: process.env.VPN_USERNAME,
        password: process.env.VPN_PASSWORD,
    });

    await page.setUserAgent('Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.0.0 Safari/537.36');
    await page.setCacheEnabled(false);

    console.log("[Puppeteer] => Launched browser");

    streamer.page = page;
    streamer.browser = browser;

    await page.goto("https://kool.to", { waitUntil: 'networkidle2' });

    const pages = await browser.pages();
    await pages[0].close();

    console.log("[Kool] => Going to https://kool.to");

    await launchKool(page, tvchannel);

    const stream = await getStream(page, { audio: true, video: true, mimeType: "video/webm;codecs=vp8,opus" });

    try {
        const { command, output } = prepareStream(stream, {
            frameRate: parseInt(process.env.STREAM_OPTIONS_FRAMERATE),
            bitrateVideo: parseInt(process.env.STREAM_OPTIONS_BITRATE),
            bitrateVideoMax: parseInt(process.env.STREAM_OPTIONS_BITRATE_MAX),
            hardwareAcceleratedDecoding: process.env.STREAM_OPTIONS_HARDWARE_ACCELERATION,
            videoCodec: Utils.normalizeVideoCodec(process.env.STREAM_OPTIONS_CODEC)
        }, cancelSignal);
        command.on("error", (err, stdout, stderr) => {
            console.log("An error occurred with ffmpeg");
            console.log(err);
        });

        await playStream(output, streamer, {
            // Use this to catch up with ffmpeg
            readrateInitialBurst: 10,
            h26xPreset: "veryfast"
        }, cancelSignal);
        console.log("Finished playing video");
    } catch (e) {
        console.log(e);
    }
}

async function launchKool(page, tvchannel) {
    console.log("[Kool] => Trying to connect to Kool");
    await page.screenshot({ path: 'screenshot.png' });
    try {
        await page.waitForSelector("input[placeholder='Search']");
    } catch (error) {
        console.log("[Kool] => Error, may need to change location or reload");
        return;
    }
    await page.click("input[placeholder='Search']");
    console.log("[Kool] => Opened channels menu");
    await page.waitForSelector('#channel-' + tvchannel);
    console.log("[Kool] => Found the channel");
    await page.click('#channel-' + tvchannel);
    await page.evaluate(async () => {
        const element = document.querySelector('div[style="display: flex; flex-grow: 1; position: absolute; top: 0px; left: 0px; background-color: black; width: 100%; min-height: 64px; align-items: center; padding-left: 15px;"]');
        if (element) {
            element.remove();
        }
    });
    console.log("[Kool] => Removed banner");
    await page.evaluate(async () => {
        const element = document.querySelector('.channels');
        if (element) {
            element.remove();
        }
    });
    console.log("[Kool] => Removed channels");
}

module.exports = { streamPuppeteer, loadUserBot, streamer };
