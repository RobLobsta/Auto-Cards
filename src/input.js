// Your "Input" tab should look like this

/* === STORY ARC CONFIGURATION === */

// Your original author's note.
state.originalAuthorsNote = "Put your original authors note here!";

// Initial heat value. Higher values increase the chance of temperature rising early.
state.initialHeatValue = 0;
// Initial temperature value. Higher values increase initial conflict.
state.initialTemperatureValue = 1;
// Chance of temperature increase. Higher values accelerate conflict.
state.temperatureIncreaseChance = 15;

// Rate of heat increase. Higher values lead to a faster-paced story.
state.heatIncreaseValue = 1;
// Amount of temperature increase. Higher values create larger jumps in tension.
state.temperatureIncreaseValue = 1;

// Player's impact on increasing conflict.
state.playerIncreaseHeatImpact = 2;
// Player's impact on decreasing conflict.
state.playerDecreaseHeatImpact = 2;
// Player's impact on increasing temperature.
state.playerIncreaseTemperatureImpact = 1;
// Player's impact on decreasing temperature.
state.playerDecreaseTemperatureImpact = 1;
// Number of conflict words from player to increase temperature.
state.threshholdPlayerIncreaseTemperature = 2;
// Number of calming words from player to decrease temperature.
state.threshholdPlayerDecreaseTemperature = 2;

// AI's impact on increasing conflict.
state.modelIncreaseHeatImpact = 1;
// AI's impact on decreasing conflict.
state.modelDecreaseHeatImpact = 2;
// AI's impact on increasing temperature.
state.modelIncreaseTemperatureImpact = 1;
// AI's impact on decreasing temperature.
state.modelDecreaseTemperatureImpact = 1;
// Number of conflict words from AI to increase temperature.
state.threshholdModelIncreaseTemperature = 3;
// Number of calming words from AI to decrease temperature.
state.threshholdModelDecreaseTemperature = 3;

// Maximum level of conflict in the story.
state.maximumTemperature = 12;
// Absolute maximum temperature. Values above 15 can be chaotic.
state.trueMaximumTemperature = 15;

// Minimum temperature the player can achieve.
state.minimumTemperature = 1;
// Absolute minimum temperature.
state.trueMinimumTemperature = 1;

// If true, the overheat timer becomes dependent on story events. (EXPERIMENTAL)
state.smartOverheatTimer = "This feature is currently being worked on, do not set it to true.";
// Number of actions before temperature decreases after reaching maximum.
state.overheatTimer = 4;
// Amount heat is reduced after overheat.
state.overheatReductionForHeat = 5;
// Amount temperature is reduced after overheat.
state.overheatReductionForTemperature = 1;

// Number of actions before temperature can increase again after an overheat.
state.cooldownTimer = 5;
// Amount temperature is reduced during each action in the cooldown phase.
state.cooldownRate = 2;

// Percent chance of a sudden, large temperature increase.
state.randomExplosionChance = 3;
// Impact of a random heat increase.
state.randomExplosionHeatIncreaseValue = 5;
// Impact of a random temperature increase.
state.randomExplosionTemperatureIncreaseValue = 2;


/* DONT MODIFY ANYTHING BEYOND THIS POINT */
function randomint(min, max) {
  min = Math.ceil(min)
  max = Math.floor(max)
  return Math.floor(Math.random() * (max - min + 1)) + min
}

const conflictWords = ["attack", "stab", "destroy", "break", "steal", "ruin", "burn", "smash", "sabotage", "disrupt", "vandalize", "overthrow", "assassinate", "plunder", "rob", "ransack", "raid", "hijack", "detonate", "explode", "ignite", "collapse", "demolish", "shatter", "strike", "slap", "obliterate", "annihilate", "corrupt", "infect", "poison", "curse", "hex", "summon", "conjure", "mutate", "provoke", "riot", "revolt", "mutiny", "rebel", "resist", "intimidate", "blackmail", "manipulate", "brainwash", "lie", "cheat", "swindle", "disarm", "fire", "hack", "overload", "flood", "drown", "rot", "dissolve", "slaughter", "terminate", "execute", "drama", "conflict", "evil", "kill", "slay", "defeat", "fight", "doom", "slice", "pain", "dying", "die", "perish", "blood"]

const calmingWords = ["calm", "rest", "relax", "meditate", "sleep", "comfort", "hug", "smile", "forgive", "mend", "repair", "plant", "sing", "dance", "celebrate", "collaborate", "share", "give", "donate", "protect", "shelter", "trust", "hope", "dream", "revive", "eat", "drink", "balance", "cheer", "laugh", "play", "build", "bake", "craft", "cook", "empathize", "apologize", "befriend", "admire", "sympathize", "thank", "appreciate", "cherish", "love", "pet", "respect", "restore", "guide", "teach", "learn", "daydream", "wander", "explore", "discover", "reflect", "happy", "joy", "kind", "heal", "help", "assist"]

const modifier = (text) => {
  if (state.heat == undefined){
    state.heat = state.initialHeatValue
    state.cooldownMode = false
    state.overheatMode = false
  }
  if (state.storyTemperature == undefined){
    state.storyTemperature = state.initialTemperatureValue
  }
  const lowerText = text.toLowerCase()
  const words = lowerText.split(/\s+/)
  let conflictCount = 0
  let calmingCount = 0

  words.forEach(word => {
    const fixedWord = word.replace(/^[^\w]+|[^\w]+$/g, '')
    if (conflictWords.includes(fixedWord)) {
      conflictCount++
    }
    if (calmingWords.includes(fixedWord)) {
      calmingCount++
    }
  })

  if (state.cooldownMode == false){
    if (conflictCount > 0) {
      state.heat += conflictCount * state.playerIncreaseHeatImpact
      if (conflictCount >= state.threshholdPlayerIncreaseTemperature){
        state.storyTemperature += conflictCount * state.playerIncreaseTemperatureImpact
        log(`Detected ${conflictCount} conflict words (Player). Increasing heat & temperature.`)
      }
      else{
        log(`Detected ${conflictCount} conflict words (Player). Increasing heat.`)
      }
    }

    if (calmingCount > 0) {
      state.heat -= conflictCount * state.playerDecreaseHeatImpact
      if (calmingCount >= state.threshholdPlayerDecreaseTemperature){
        state.storyTemperature -= calmingCount * state.playerDecreaseTemperatureImpact
        log(`Detected ${calmingCount} calming words (Player). Decreasing heat & temperature.`)
      }
      else{
        log(`Detected ${calmingCount} calming words (Player). Decreasing heat.`)
      }
    }
  }

  state.chance = randomint(1, 100)
  if (state.chance <= state.randomExplosionChance){
    state.heat = state.heat + state.randomExplosionHeatIncreaseValue
    state.storyTemperature = state.storyTemperature + state.randomExplosionTemperatureIncreaseValue
    log("!WARNING! Explosion Occured! (+" + state.randomExplosionHeatIncreaseValue + " heat) (+" + state.randomExplosionTemperatureIncreaseValue + " temperature)")
  }
  if(state.cooldownMode == false && state.overheatMode == false){
    state.heat = state.heat + state.heatIncreaseValue
    log("Heat: " + state.heat)
  }
  state.chance = randomint(1, state.temperatureIncreaseChance)
  if (state.chance <= state.heat){
    state.heat = 0
    state.storyTemperature = state.storyTemperature + state.temperatureIncreaseValue
    log("Temperature Increased. Temperature is now " + state.storyTemperature)
  }
  if (state.storyTemperature >= state.maximumTemperature){
    if (state.cooldownMode == false && state.overheatMode == false){
      state.overheatMode = true
      state.overheatTurnsLeft = state.overheatTimer
      log("Overheat Mode Activated")
    }
  }
  if (state.cooldownMode == true){
    state.cooldownTurnsLeft --
    log("Cooldown Timer: " + state.cooldownTurnsLeft)
    state.storyTemperature = state.storyTemperature - state.cooldownRate
    if(state.cooldownTurnsLeft <= 0){
      state.cooldownMode = false
      log("Cooldown Mode Disabled")
    }
  }
  else{
    if(state.overheatMode == true){
      state.overheatTurnsLeft --
      log("Overheat Timer: " + state.overheatTurnsLeft)
      if (state.overheatTurnsLeft <= 0){
        state.storyTemperature = state.storyTemperature - state.overheatReductionForTemperature
        state.heat = state.heat - state.overheatReductionForHeat
        state.overheatMode = false
        state.cooldownMode = true
        state.cooldownTurnsLeft = state.cooldownTimer
        log("Cooldown Mode Activated")
      }
    }
  }

  if (state.storyTemperature > state.trueMaximumTemperature){
    state.storyTemperature = state.trueMaximumTemperature
    log("Temperature over maximum, recalibrating...")
  }
  if (state.storyTemperature <= 0){
    state.storyTemperature = 1
    log("Temperature under minimum, recalibrating...")
  }

  if (state.cooldownMode == false){
    log("cooldownMode false, deploying prompt")
  //Non-Optimized Story Prompts
    if (state.storyTemperature == 1) {
      state.memory.authorsNote = "Story Phase: Introduction. Introduce characters and locations. There should be no conflict or tension in the story. " + state.originalAuthorsNote
    }
    if (state.storyTemperature == 2) {
      state.memory.authorsNote = "Story Phase: Introduction. Introduce characters, locations, and plot hooks. There should be only a little conflict and tension in the story unless the player is seeking it out. " + state.originalAuthorsNote
    }
    if (state.storyTemperature == 3) {
      state.memory.authorsNote = "Story Phase: Introduction. Introduce characters, locations, and plot hooks. There should be only minor conflicts. Introduce the possibility of a moderate conflict that could appear far in the future. " + state.originalAuthorsNote
    }
    if (state.storyTemperature == 4) {
      state.memory.authorsNote = "Story Phase: Introduction. Introduce characters, locations, and plot hooks. There should be only minor conflicts. Introduce the possibility of a moderate conflict that could appear far in the future. " + state.originalAuthorsNote
    }
    if (state.storyTemperature == 5) {
      state.memory.authorsNote = "Story Phase: Rising Action. Introduce more minor conflicts. Give minor hints as to what a greater conflict in the far future could be. " + state.originalAuthorsNote
    }
    if (state.storyTemperature == 6) {
      state.memory.authorsNote = "Story Phase: Rising Action. Introduce the occasional moderate conflict. Give minor hints as to what a greater conflict in the far future could be. " + state.originalAuthorsNote
    }
    if (state.storyTemperature == 7) {
      state.memory.authorsNote = "Story Phase: Rising Action. Introduce the occasional moderate conflict. Give minor hints as to what a greater conflict in the far future could be. Introduce conntections to discovered plot hooks. " + state.originalAuthorsNote
    }
    if (state.storyTemperature == 8) {
      state.memory.authorsNote = "Story Phase: Rising Action. Introduce the occasional moderate conflict. Give moderate hints as to what a greater conflict in the far future could be. Introduce conntections to discovered plot hooks. " + state.originalAuthorsNote
    }
    if (state.storyTemperature == 9) {
      state.memory.authorsNote = "Story Phase: Rising Action. Introduce the occasional moderate conflict. Give moderate hints as to what a greater conflict in the far future could be. Introduce conntections to discovered plot hooks. Begin moving the story towards the greater conflict ahead. " + state.originalAuthorsNote
    }
    if (state.storyTemperature == 10) {
      state.memory.authorsNote = "Story Phase: Climax. Introduce the climax of the story. All previous hints about this greater conflict should intersect with this climactic moment. Plot hooks should be connected to this climax. Emphisise major conflict. " + state.originalAuthorsNote
    }
    if (state.storyTemperature == 11) {
      state.memory.authorsNote = "Story Phase: Climax. Plot hooks should be connected to this climax. Emphisise major conflict. Push the characters near their limits while staying fair. " + state.originalAuthorsNote
    }
    if (state.storyTemperature == 12) {
      state.memory.authorsNote = "Story Phase: Climax. Advance the climax of the story, introduce a challenge to go with it. Emphisise major conflict. Push the characters near their limits while staying fair. " + state.originalAuthorsNote
    }
    if (state.storyTemperature == 13) {
      state.memory.authorsNote = "Story Phase: Climax. Advance the climax of the story, introduce challenges to go with it. Emphisise major conflict. Push the characters to their limits. Punish terrible decisions with an appropreate story response. " + state.originalAuthorsNote
    }
    if (state.storyTemperature == 14) {
      state.memory.authorsNote = "Story Phase: Climax. Advance the climax of the story. Emphisise major conflict. Push the characters to their limits. Punish bad decisions while not being unfair. " + state.originalAuthorsNote
    }
    if (state.storyTemperature == 15) {
      state.memory.authorsNote = "Story Phase: Climax. Advance the climax of the story. Emphisise major conflict. Push the characters to their limits. Punish bad decisions that the characters make. Be unfair at times, but make unfairness in the story make sense with the current plot. " + state.originalAuthorsNote
    }
    if (state.storyTemperature == 16) {
      //!WARNING! IT IS NOT RECOMMENDED FOR YOUR STORY TO GET TO THIS STATE. ONLY ENABLE YOUR TRUE MAXIMUM TEMPERATURE TO THIS VALUE IF YOU REALLY REALLY WANT IT TO BE PUNISHING.
      state.memory.authorsNote = "Story Phase: Ultimate Climax. Emphisise increadibly difficult conflict. Push the characters to their limits. Punish bad decisions that the characters make. Be unfair at times. " + state.originalAuthorsNote
    }
    if (state.storyTemperature == 17) {
      //!WARNING! IT IS NOT RECOMMENDED FOR YOUR STORY TO GET TO THIS STATE. ONLY ENABLE YOUR TRUE MAXIMUM TEMPERATURE TO THIS VALUE IF YOU REALLY REALLY WANT IT TO BE PUNISHING.
      state.memory.authorsNote = "Story Phase: Ultimate Climax. Emphisise insanely difficult conflict. Push the characters to their absolute limits. Punish bad decisions that the characters make. Make the challenges unfair for characters. " + state.originalAuthorsNote
    }
    if (state.storyTemperature == 18) {
      //!WARNING! IT IS NOT RECOMMENDED FOR YOUR STORY TO GET TO THIS STATE. ONLY ENABLE YOUR TRUE MAXIMUM TEMPERATURE TO THIS VALUE IF YOU REALLY REALLY WANT IT TO BE PUNISHING.
      state.memory.authorsNote = "Story Phase: Ultimate Climax. Emphisise insanely difficult conflict. Push the characters to their absolute limits. Heavily punish bad decisions that the characters make. Make the challenges increadibly unfair. " + state.originalAuthorsNote
    }
    if (state.storyTemperature == 19) {
      //!WARNING! IT IS NOT RECOMMENDED FOR YOUR STORY TO GET TO THIS STATE. ONLY ENABLE YOUR TRUE MAXIMUM TEMPERATURE TO THIS VALUE IF YOU REALLY REALLY WANT IT TO BE PUNISHING.
      state.memory.authorsNote = "Story Phase: Ultimate Climax. Emphisise impossibly difficult conflict. Push the characters to their absolute limits. Very heavily punish bad decisions that the characters make. Make the challenges increadibly unfair. " + state.originalAuthorsNote
    }
    if (state.storyTemperature == 20) {
      //!WARNING! IT IS NOT RECOMMENDED FOR YOUR STORY TO GET TO THIS STATE. ONLY ENABLE YOUR TRUE MAXIMUM TEMPERATURE TO THIS VALUE IF YOU REALLY REALLY WANT IT TO BE PUNISHING.
      state.memory.authorsNote = "Story Phase: Omega Insane Ultimate Climax of Doom. Emphisise insanely difficult conflict. Push the characters to their absolute limits. Very heavily punish bad decisions that the characters make. Make the challenges increadibly unfair. There is no success. " + state.originalAuthorsNote
    }
    if (state.storyTemperature > 20) {
      //!WARNING! IT IS NOT RECOMMENDED FOR YOUR STORY TO GET TO THIS STATE. ONLY ENABLE YOUR TRUE MAXIMUM TEMPERATURE TO THIS VALUE IF YOU REALLY REALLY WANT IT TO BE PUNISHING.
      state.memory.authorsNote = "Story Phase: Apocalypse. Emphisise impossible conflict. There is no success. Make challenges blatently unfair. Punish every decision. Actively attempt to push the characters away from their goal in any way possible. " + state.originalAuthorsNote
    }
  }
  else{
    log("cooldownMode true, deploying alternate prompt")
  //Cooldown Prompts
    if (state.storyTemperature <= 1) {
      state.cooldownMode = false
    }
    if (state.storyTemperature == 2) {
      state.memory.authorsNote = "Story Phase: Downtime. There should be only small bits of tension, with most of the current story being filled with peace and quiet. " + state.originalAuthorsNote
    }
    if (state.storyTemperature == 3) {
      state.memory.authorsNote = "Story Phase: Downtime. There should be only minor tension, with most of the current story being filled with peace and quiet. " + state.originalAuthorsNote
    }
    if (state.storyTemperature == 4) {
      state.memory.authorsNote = "Story Phase: Downtime. There should be only minor tension, with most of the current story being filled with peaceful encounters. " + state.originalAuthorsNote
    }
    if (state.storyTemperature == 5) {
      state.memory.authorsNote = "Story Phase: Downtime. There should be only minor tension, with most of the current story being filled with peaceful encounters, unless characters actively try to cause chaos. " + state.originalAuthorsNote
    }
    if (state.storyTemperature == 6) {
      state.memory.authorsNote = "Story Phase: Downtime. There should be only minor tension and conflict, with most of the current story being filled with peaceful encounters, unless characters actively try to cause chaos." + state.originalAuthorsNote
    }
    if (state.storyTemperature == 7) {
      state.memory.authorsNote = "Story Phase: Downtime. There should be only minor tension and conflict, with most of the current story being filled with neutral encounters, unless characters actively try to cause chaos. " + state.originalAuthorsNote
    }
    if (state.storyTemperature == 8) {
      state.memory.authorsNote = "Story Phase: Downtime. There should be only minor tension and conflict, with most of the current story containing neutral encounters and minor surprises. This section of story should have a satisfying conclusion for its characters. " + state.originalAuthorsNote
    }
    if (state.storyTemperature == 9) {
      state.memory.authorsNote = "Story Phase: Falling Action. The conflicts should be quickly ending, and this section of story should have a satisfying conclusion for its characters. There is still some minor tension and conflict. " + state.originalAuthorsNote
    }
    if (state.storyTemperature == 10) {
      state.memory.authorsNote = "Story Phase: Falling Action. The conflicts should be slowly ending, and this section of story should have a satisfying conclusion for its characters. There is still some moderate tension and conflict. " + state.originalAuthorsNote
    }
    if (state.storyTemperature == 11) {
      state.memory.authorsNote = "Story Phase: Falling Action. The conflicts should be slowly ending, and this section of story should have a satisfying conclusion for its characters. There is still moderate tension and conflict, but not as much as before. " + state.originalAuthorsNote
    }
    if (state.storyTemperature == 12) {
      state.memory.authorsNote = "Story Phase: Falling Action. The conflicts should be slowly ending, and this section of story should have a satisfying conclusion for its characters. There is still moderatly high tension and conflict, but not as much as before. " + state.originalAuthorsNote
    }
    if (state.storyTemperature == 13) {
      state.memory.authorsNote = "Story Phase: Falling Action. The conflicts should be slowly ending. There is still moderatly high tension and conflict, but not as much as before. " + state.originalAuthorsNote
    }
    if (state.storyTemperature == 14) {
      state.memory.authorsNote = "Story Phase: Falling Action. The conflicts should be beginning to come to a close. There is still moderatly high tension and conflict, but not as much as before. " + state.originalAuthorsNote
    }
    if (state.storyTemperature == 15) {
      state.memory.authorsNote = "Story Phase: Falling Action. The conflicts should be beginning to come to a close. Tension and conflict is still high. " + state.originalAuthorsNote
    }
    if (state.storyTemperature == 16) {
      state.memory.authorsNote = "Story Phase: Extreme Falling Action. The conflicts should start to show signs of ending. Tension and conflict is still high. " + state.originalAuthorsNote
    }
    if (state.storyTemperature == 17) {
      state.memory.authorsNote = "Story Phase: Extreme Falling Action. The conflicts should start to show signs of slightly ending. Tension and conflict is still high. " + state.originalAuthorsNote
    }
    if (state.storyTemperature == 18) {
      state.memory.authorsNote = "Story Phase: Extreme Falling Action. The conflicts should start to show signs of slightly ending. Tension and conflict is still very high. " + state.originalAuthorsNote
    }
    if (state.storyTemperature == 19) {
      state.memory.authorsNote = "Story Phase: Extreme Falling Action. Tension and conflict is still very high. " + state.originalAuthorsNote
    }
    if (state.storyTemperature >= 20) {
      state.memory.authorsNote = "Story Phase: Omega Extreme Falling Action. Tension and conflict is still extremely high. " + state.originalAuthorsNote
    }
  }
  state.authorsNoteStorage = state.memory.authorsNote;

  text = AutoCards("input", text);
  return { text };
};

// Don't modify this part
modifier(text);
