const runDailyActions = require('./runDailyActions')

// Heure d'exécution souhaitée
const executionHour = 0; // Remplacez par l'heure souhaitée
const executionMinute = 0; // Remplacez par les minutes souhaitées
const executionSecond = 0; // Remplacez par les secondes souhaitées

module.exports = async function runAtMidmight() {

    async function executeAtMidnight() {
    // Placez ici le code que vous souhaitez exécuter tous les jours à minuit
    console.log("[actions] => ran daily actions");
    await runDailyActions()
    
    // Planifie l'exécution pour le prochain jour à minuit
    const now = new Date();
    const nextExecution = new Date(now.getFullYear(), now.getMonth(), now.getDate(), executionHour, executionMinute, executionSecond);
    let timeUntilNextExecution = nextExecution - now;
    
    if (timeUntilNextExecution < 0) {
        timeUntilNextExecution += 24 * 60 * 60 * 1000; // Ajoute 24 heures en millisecondes
    }
    
    setTimeout(executeAtMidnight, timeUntilNextExecution);
  }
  
  // Détermine le délai jusqu'à l'heure d'exécution d'aujourd'hui
  const now = new Date();
  const executionTime = new Date(now.getFullYear(), now.getMonth(), now.getDate(), executionHour, executionMinute, executionSecond);
  let timeUntilExecution = executionTime - now;
  
  if (timeUntilExecution < 0) {
      timeUntilExecution += 24 * 60 * 60 * 1000; // Ajoute 24 heures en millisecondes
  }
  
  setTimeout(executeAtMidnight, timeUntilExecution);
}