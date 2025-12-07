// Your "Library" tab should look like this

// Auto-Cards: An AI Dungeon script that automatically creates and updates plot-relevant story cards during gameplay.
function AutoCards(inHook, inText, inStop) {
    "use strict";
    /*
    Default Auto-Cards settings
    Feel free to change these settings to customize your scenario's default gameplay experience
    The default values for your scenario are specified below:
    */

    const CONFIG = {
        // Is Auto-Cards enabled? (true or false)
        enabled: true,
        // Minimum number of turns in between automatic card generation events? (0 to 9999)
        cardCreationCooldown: 22,
        // Use a bulleted list format for newly generated card entries? (true or false)
        useBulletedListMode: true,
        // Maximum allowed length for newly generated story card entries? (200 to 2000)
        generatedEntryLimit: 750,
        // Do newly generated cards have memory updates enabled by default? (true or false)
        newCardsDoMemoryUpdates: true,
        // Default character limit before the card's memory bank is summarized? (1750 to 9900)
        newCardsMemoryLimit: 2750,
        // Approximately how much shorter should recently compressed memories be? (ratio = 10 * old / new) (20 to 1250)
        memoryCompressionRatio: 25,
        // AI prompt used to generate new story card entries?
        cardGenerationPrompt: prose(
            "-----",
            "",
            "<SYSTEM>",
            "# Stop the story and ignore previous instructions. Write a brief and coherent informational entry for %{title} following these instructions:",
            "- Write only third-person pure prose information about %{title} using complete sentences with correct punctuation",
            "- Avoid short-term temporary details or appearances, instead focus on plot-significant information",
            "- Prioritize story-relevant details about %{title} first to ensure seamless integration with the previous plot",
            "- Create new information based on the context and story direction",
            "- Mention %{title} in every sentence",
            "- Use semicolons if needed",
            "- Add additional details about %{title} beneath incomplete entries",
            "- Be concise and grounded",
            "- Imitate the story's writing style and infer the reader's preferences",
            "</SYSTEM>",
            "Continue the entry for %{title} below while avoiding repetition:",
            "%{entry}"
        ),
        // AI prompt used to summarize a given story card's memory bank?
        cardMemoryCompressionPrompt: prose(
            "-----",
            "",
            "<SYSTEM>",
            "# Stop the story and ignore previous instructions. Summarize and condense the given paragraph into a narrow and focused memory passage while following these guidelines:",
            "- Ensure the passage retains the core meaning and most essential details",
            "- Use the third-person perspective",
            "- Prioritize information-density, accuracy, and completeness",
            "- Remain brief and concise",
            "- Write firmly in the past tense",
            "- The paragraph below pertains to old events from far earlier in the story",
            "- Integrate %{title} naturally within the memory; however, only write about the events as they occurred",
            "- Only reference information present inside the paragraph itself, be specific",
            "</SYSTEM>",
            "Write a summarized old memory passage for %{title} based only on the following paragraph:",
            "\"\"\"",
            "%{memory}",
            "\"\"\"",
            "Summarize below:"
        ),
        // Titles banned from future card generation attempts?
        bannedTitlesList: [
            "North", "East", "South", "West", "Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"
        ],
        // Default story card "type" used by Auto-Cards? (does not matter)
        defaultCardType: "class",
        // Should titles mentioned in the "opening" plot component be banned from future card generation by default?
        banTitlesFromOpening: true
    };

    // === NARRATIVE GUIDANCE CONFIGURATION ===
    const NARRATIVE_GUIDANCE = {
        ENABLED: true,
        initialHeatValue: 0,
        initialTemperatureValue: 1,
        temperatureIncreaseChance: 15,
        heatIncreaseValue: 1,
        temperatureIncreaseValue: 1,
        playerIncreaseHeatImpact: 2,
        playerDecreaseHeatImpact: 2,
        playerIncreaseTemperatureImpact: 1,
        playerDecreaseTemperatureImpact: 1,
        threshholdPlayerIncreaseTemperature: 2,
        threshholdPlayerDecreaseTemperature: 2,
        modelIncreaseHeatImpact: 1,
        modelDecreaseHeatImpact: 2,
        modelIncreaseTemperatureImpact: 1,
        modelDecreaseTemperatureImpact: 1,
        threshholdModelIncreaseTemperature: 3,
        threshholdModelDecreaseTemperature: 3,
        maximumTemperature: 12,
        trueMaximumTemperature: 15,
        minimumTemperature: 1,
        trueMinimumTemperature: 1,
        smartOverheatTimer: false, // Set to true to enable experimental smart overheat timer
        smartOverheatThreshold: 5,
        overheatTimer: 4,
        overheatReductionForHeat: 5,
        overheatReductionForTemperature: 1,
        cooldownTimer: 5,
        cooldownRate: 2,
        randomExplosionChance: 3,
        randomExplosionHeatIncreaseValue: 5,
        randomExplosionTemperatureIncreaseValue: 2,
        originalAuthorsNote: "Put your original authors note here!",
        conflictWords: ["attack", "stab", "destroy", "break", "steal", "ruin", "burn", "smash", "sabotage", "disrupt", "vandalize", "overthrow", "assassinate", "plunder", "rob", "ransack", "raid", "hijack", "detonate", "explode", "ignite", "collapse", "demolish", "shatter", "strike", "slap", "obliterate", "annihilate", "corrupt", "infect", "poison", "curse", "hex", "summon", "conjure", "mutate", "provoke", "riot", "revolt", "mutiny", "rebel", "resist", "intimidate", "blackmail", "manipulate", "brainwash", "lie", "cheat", "swindle", "disarm", "fire", "hack", "overload", "flood", "drown", "rot", "dissolve", "slaughter", "terminate", "execute", "drama", "conflict", "evil", "kill", "slay", "defeat", "fight", "doom", "slice", "pain", "dying", "die", "perish", "blood", "scream", "yell", "argue", "threaten", "wound", "injure", "betray"],
        calmingWords: ["calm", "rest", "relax", "meditate", "sleep", "comfort", "hug", "smile", "forgive", "mend", "repair", "plant", "sing", "dance", "celebrate", "collaborate", "share", "give", "donate", "protect", "shelter", "trust", "hope", "dream", "revive", "eat", "drink", "balance", "cheer", "laugh", "play", "build", "bake", "craft", "cook", "empathize", "apologize", "befriend", "admire", "sympathize", "thank", "appreciate", "cherish", "love", "pet", "respect", "restore", "guide", "teach", "learn", "daydream", "wander", "explore", "discover", "reflect", "happy", "joy", "kind", "heal", "help", "assist", "console", "cuddle", "snuggle", "read", "write", "paint", "draw", "create", "agree", "accept", "praise"],
        temperatureMap: [
            {
                threshold: 1,
                prompt: "Story Phase: Introduction. Introduce characters and locations. There should be no conflict or tension in the story. "
            },
            {
                threshold: 2,
                prompt: "Story Phase: Introduction. Introduce characters, locations, and plot hooks. There should be only a little conflict and tension in the story unless the player is seeking it out. "
            },
            {
                threshold: 4,
                prompt: "Story Phase: Introduction. Introduce characters, locations, and plot hooks. There should be only minor conflicts. Introduce the possibility of a moderate conflict that could appear far in the future. "
            },
            {
                threshold: 5,
                prompt: "Story Phase: Rising Action. Introduce more minor conflicts. Give minor hints as to what a greater conflict in the far future could be. "
            },
            {
                threshold: 7,
                prompt: "Story Phase: Rising Action. Introduce the occasional moderate conflict. Give minor hints as to what a greater conflict in the far future could be. Introduce conntections to discovered plot hooks. "
            },
            {
                threshold: 9,
                prompt: "Story Phase: Rising Action. Introduce the occasional moderate conflict. Give moderate hints as to what a greater conflict in the far future could be. Introduce conntections to discovered plot hooks. Begin moving the story towards the greater conflict ahead. "
            },
            {
                threshold: 10,
                prompt: "Story Phase: Climax. Introduce the climax of the story. All previous hints about this greater conflict should intersect with this climactic moment. Plot hooks should be connected to this climax. Emphisise major conflict. "
            },
            {
                threshold: 12,
                prompt: "Story Phase: Climax. Advance the climax of the story, introduce a challenge to go with it. Emphisise major conflict. Push the characters near their limits while staying fair. "
            },
            {
                threshold: 14,
                prompt: "Story Phase: Climax. Advance the climax of the story. Emphisise major conflict. Push the characters to their limits. Punish bad decisions while not being unfair. "
            },
            {
                threshold: 15,
                prompt: "Story Phase: Climax. Advance the climax of the story. Emphisise major conflict. Push the characters to their limits. Punish bad decisions that the characters make. Be unfair at times, but make unfairness in the story make sense with the current plot. "
            },
            {
                threshold: 18,
                prompt: "!WARNING! IT IS NOT RECOMMENDED FOR YOUR STORY TO GET TO THIS STATE. ONLY ENABLE YOUR TRUE MAXIMUM TEMPERATURE TO THIS VALUE IF YOU REALLY REALLY WANT IT TO BE PUNISHING. Story Phase: Ultimate Climax. Emphisise insanely difficult conflict. Push the characters to their absolute limits. Heavily punish bad decisions that the characters make. Make the challenges increadibly unfair. "
            },
            {
                threshold: 19,
                prompt: "!WARNING! IT IS NOT RECOMMENDED FOR YOUR STORY TO GET TO THIS STATE. ONLY ENABLE YOUR TRUE MAXIMUM TEMPERATURE TO THIS VALUE IF YOU REALLY REALLY WANT IT TO BE PUNISHING. Story Phase: Ultimate Climax. Emphisise impossibly difficult conflict. Push the characters to their absolute limits. Very heavily punish bad decisions that the characters make. Make the challenges increadibly unfair. "
            },
            {
                threshold: 20,
                prompt: "!WARNING! IT IS NOT RECOMMENDED FOR YOUR STORY TO GET TO THIS STATE. ONLY ENABLE YOUR TRUE MAXIMUM TEMPERATURE TO THIS VALUE IF YOU REALLY REALLY WANT IT TO BE PUNISHING. Story Phase: Omega Insane Ultimate Climax of Doom. Emphisise insanely difficult conflict. Push the characters to their absolute limits. Very heavily punish bad decisions that the characters make. Make the challenges increadibly unfair. There is no success. "
            },
            {
                threshold: Infinity,
                prompt: "!WARNING! IT IS NOT RECOMMENDED FOR YOUR STORY TO GET TO THIS STATE. ONLY ENABLE YOUR TRUE MAXIMUM TEMPERATURE TO THIS VALUE IF YOU REALLY REALLY WANT IT TO BE PUNISHING. Story Phase: Apocalypse. Emphisise impossible conflict. There is no success. Make challenges blatently unfair. Punish every decision. Actively attempt to push the characters away from their goal in any way possible. "
            }
        ],
        cooldownTemperatureMap: [
            {
                threshold: 3,
                prompt: "Story Phase: Downtime. There should be only minor tension, with most of the current story being filled with peace and quiet. "
            },
            {
                threshold: 5,
                prompt: "Story Phase: Downtime. There should be only minor tension, with most of the current story being filled with peaceful encounters, unless characters actively try to cause chaos. "
            },
            {
                threshold: 7,
                prompt: "Story Phase: Downtime. There should be only minor tension and conflict, with most of the current story being filled with neutral encounters, unless characters actively try to cause chaos. "
            },
            {
                threshold: 8,
                prompt: "Story Phase: Downtime. There should be only minor tension and conflict, with most of the current story containing neutral encounters and minor surprises. This section of story should have a satisfying conclusion for its characters. "
            },
            {
                threshold: 9,
                prompt: "Story Phase: Falling Action. The conflicts should be quickly ending, and this section of story should have a satisfying conclusion for its characters. There is still some minor tension and conflict. "
            },
            {
                threshold: 11,
                prompt: "Story Phase: Falling Action. The conflicts should be slowly ending, and this section of story should have a satisfying conclusion for its characters. There is still moderate tension and conflict, but not as much as before. "
            },
            {
                threshold: 12,
                prompt: "Story Phase: Falling Action. The conflicts should be slowly ending, and this section of story should have a satisfying conclusion for its characters. There is still moderatly high tension and conflict, but not as much as before. "
            },
            {
                threshold: 14,
                prompt: "Story Phase: Falling Action. The conflicts should be beginning to come to a close. There is still moderatly high tension and conflict, but not as much as before. "
            },
            {
                threshold: 15,
                prompt: "Story Phase: Falling Action. The conflicts should be beginning to come to a close. Tension and conflict is still high. "
            },
            {
                threshold: 18,
                prompt: "Story Phase: Extreme Falling Action. The conflicts should start to show signs of slightly ending. Tension and conflict is still very high. "
            },
            {
                threshold: 19,
                prompt: "Story Phase: Extreme Falling Action. Tension and conflict is still very high. "
            },
            {
                threshold: Infinity,
                prompt: "Story Phase: Omega Extreme Falling Action. Tension and conflict is still extremely high. "
            }
        ]
    };

    //—————————————————————————————————————————————————————————————————————————————————

    // Main implementation of the Auto-Cards script.

    // Hoisted class definitions for better organization.
    const Const = hoistConst();
    const O = hoistO();
    const Words = hoistWords();
    const StringsHashed = hoistStringsHashed();
    const Internal = hoistInternal();
    // AutoCards has an explicitly immutable domain: HOOK, TEXT, and STOP
    const HOOK = inHook;
    const TEXT = ((typeof inText === "string") && inText) || "\n";
    const STOP = (inStop === true);
    // AutoCards returns a pseudoimmutable codomain which is initialized only once before being read and returned
    const CODOMAIN = new Const().declare();
    // Transient sets for high-performance lookup
    const [used, bans, auto, forenames, surnames] = Array.from({length: 5}, () => new Set());
    const memoized = new Map();
    // Holds a reference to the data card singleton, remains unassigned unless required
    let data = null;
    // Validate globalThis.text
    text = ((typeof text === "string") && text) || "\n";
    const AC = (function() {
        if (state.AutoCards && typeof state.AutoCards === 'object' && state.AutoCards.config) {
            return state.AutoCards;
        }

        const dataVariants = getDataVariants();
        data = getSingletonCard(false, O.f({...dataVariants.critical}), O.f({...dataVariants.debug}));

        if (data && data.description) {
            try {
                const parsed = JSON.parse(data.description);
                if (parsed && typeof parsed === 'object' && parsed.config) {
                    return parsed;
                }
            } catch (e) {
                // JSON parsing failed, fall through to reinitialize
            }
        }

        // AC is malformed, reinitialize with default values
        return {
            // In-game configurable parameters
            config: { ...CONFIG },
            // Collection of various short-term signals passed forward in time
            signal: {
                // API: Suspend nearly all Auto-Cards processes
                emergencyHalt: false,
                // API: Forcefully toggle Auto-Cards on or off
                forceToggle: null,
                // API: Banned titles were externally overwritten
                overrideBans: 0,
                // Signal the construction of the opposite control card during the upcoming onOutput hook
                swapControlCards: false,
                // Signal a limited recheck of recent title candidates following a retry or erase
                recheckRetryOrErase: false,
                // Signal an upcoming onOutput text replacement
                outputReplacement: "",
                // info.maxChars is only defined onContext but must be accessed during other hooks too
                maxChars: Math.abs(info?.maxChars || 3200),
                // An error occured within the isolateLSIv2 scope during an earlier hook
                upstreamError: ""
            },
            // Moderates the generation of new story card entries
            generation: {
                // Number of story progression turns between card generations
                cooldown: validateCooldown(underQuarterInteger(validateCooldown(CONFIG.cardCreationCooldown))),
                // Continues prompted so far
                completed: 0,
                // Upper limit on consecutive continues
                permitted: 34,
                // Properties of the incomplete story card
                workpiece: O.f({}),
                // Pending card generations
                pending: [],
            },
            // Moderates the compression of story card memories
            compression: {
                // Continues prompted so far
                completed: 0,
                // A title header reference key for this auto-card
                titleKey: "",
                // The full and proper title
                vanityTitle: "",
                // Response length estimate used to compute # of outputs remaining
                responseEstimate: 1400,
                // Indices [0, n] of oldMemoryBank memories used to build the current memory construct
                lastConstructIndex: -1,
                // Bank of card memories awaiting compression
                oldMemoryBank: [],
                // Incomplete bank of newly compressed card memories
                newMemoryBank: [],
            },
            // Prevents incompatibility issues borne of state.message modification
            message: {
                // Last turn's state.message
                previous: getStateMessage(),
                // API: Allow Auto-Cards to post messages?
                suppress: false,
                // Pending Auto-Cards message(s)
                pending: [],
                // Counter to track all Auto-Cards message events
                event: 0
            },
            // Timekeeper used for temporal events
            chronometer: {
                // Previous turn's measurement of info.actionCount
                turn: getTurn(),
                // Whether or not various turn counters should be stepped (falsified by retry actions)
                step: true,
                // Number of consecutive turn interruptions
                amnesia: 0,
                // API: Postpone Auto-Cards externalities for n many turns
                postpone: 0,
            },
            // Scalable atabase to store dynamic game information
            database: {
                // Words are pale shadows of forgotten names. As names have power, words have power
                titles: {
                    // A transient array of known titles parsed from card titles, entry title headers, and trigger keywords
                    used: [],
                    // Titles banned from future card generation attempts and various maintenance procedures
                    banned: [...CONFIG.bannedTitlesList],
                    // Potential future card titles and their turns of occurrence
                    candidates: [],
                    // Helps avoid rechecking the same action text more than once, generally
                    lastActionParsed: -1,
                    // Ensures weird combinations of retry/erase events remain predictable
                    lastTextHash: "%@%",
                    // Newly banned titles which will be added to the config card
                    pendingBans: [],
                    // Currently banned titles which will be removed from the config card
                    pendingUnbans: []
                },
                // Memories are parsed from context and handled by various operations (basically magic)
                memories: {
                    // Dynamic store of 'story card -> memory' conceptual relations
                    associations: {},
                    // Serialized hashset of the 2000 most recent near-duplicate memories purged from context
                    duplicates: "%@%"
                },
                inventory: {
                    items: {}
                }
            }
        };
    })();
    O.f(AC);
    O.s(AC.config);
    O.s(AC.signal);
    O.s(AC.generation);
    O.s(AC.generation.workpiece);
    AC.generation.pending.forEach(request => O.s(request));
    O.s(AC.compression);
    O.s(AC.message);
    O.s(AC.chronometer);
    O.f(AC.database);
    O.s(AC.database.titles);
    O.s(AC.database.memories);
    if (!HOOK) {
        globalThis.stop ??= false;
        AC.signal.maxChars = Math.abs(info?.maxChars || AC.signal.maxChars);
        if (HOOK === null) {
            if (/Recent\s*Story\s*:/i.test(text)) {
                // AutoCards(null) is always invoked once after being declared within the shared library
                // Context must be cleaned before passing text to the context modifier
                // This measure is taken to ensure compatability with other scripts
                // First, remove all command, continue, and comfirmation messages from the context window
                text = (text
                    // Hide the guide
                    .replace(/\s*>>>\s*Detailed\s*Guide\s*:[\s\S]*?<<<\s*/gi, "\n\n")
                    // Excise all /AC command messages
                    .replace(/\s*>>>\s*Auto-Cards\s*has\s*been\s*enabled!\s*<<<\s*/gi, " ")
                    .replace(/^.*\/\s*A\s*C.*$/gmi, "%@%")
                    .replace(/\s*%@%\s*/g, " ")
                    // Consolidate all consecutive continue messages into placeholder substrings
                    .replace(/(?:(?:\s*>>>\s*please\s*select\s*"continue"\s*\([\s\S]*?\)\s*<<<\s*)+)/gi, message => {
                        // Replace all continue messages with %@+%-patterned substrings
                        return (
                            // The # of "@" symbols corresponds with the # of consecutive continue messages
                            "%" + "@".repeat(
                                // Count the number of consecutive continue message occurrences
                                (message.match(/>>>\s*please\s*select\s*"continue"\s*\([\s\S]*?\)\s*<<</gi) || []).length
                            ) + "%"
                        );
                    })
                    // Situationally replace all placeholder substrings with either spaces or double newlines
                    .replace(/%@+%/g, (match, matchIndex, intermediateText) => {
                        // Check the case of the next char following the match to decide how to replace it
                        let i = matchIndex + match.length;
                        let nextChar = intermediateText[i];
                        if (nextChar === undefined) {
                            return " ";
                        } else if (/^[A-Z]$/.test(nextChar)) {
                            // Probably denotes a new sentence/paragraph
                            return "\n\n";
                        } else if (/^[a-z]$/.test(nextChar)) {
                            return " ";
                        }
                        // The first nextChar was a weird punctuation char, find the next non-whitespace char
                        do {
                            i++;
                            nextChar = intermediateText[i];
                            if (nextChar === undefined) {
                                return " ";
                            }
                        } while (/\s/.test(nextChar));
                        if (nextChar === nextChar.toUpperCase()) {
                            // Probably denotes a new sentence/paragraph
                            return "\n\n";
                        }
                        // Returning " " probably indicates a previous output's incompleteness
                        return " ";
                    })
                    // Remove all comfirmation requests and responses
                    .replace(/\s*\n*.*CONFIRM\s*DELETE.*\n*\s*/gi, confirmation => {
                        if (confirmation.includes("<<<")) {
                            return " ";
                        } else {
                            return "";
                        }
                    })
                    // Remove dumb memories from the context window
                    // (Latitude, if you're reading this, please give us memoryBank read/write access 😭)
                    .replace(/(Memories\s*:)\s*([\s\S]*?)\s*(Recent\s*Story\s*:|$)/i, (_, left, memories, right) => {
                        return (left + "\n" + (memories
                            .split("\n")
                            .filter(memory => {
                                const lowerMemory = memory.toLowerCase();
                                return !(
                                    (lowerMemory.includes("select") && lowerMemory.includes("continue"))
                                    || lowerMemory.includes(">>>") || lowerMemory.includes("<<<")
                                );
                            })
                            .join("\n")
                        ) + (function() {
                            if (right !== "") {
                                return "\n\n" + right;
                            } else {
                                return "";
                            }
                        })());
                    })
                    // Remove LSIv2 error messages
                    .replace(/(?:\s*>>>[\s\S]*?<<<\s*)+/g, " ")
                );
                if (!shouldProceed()) {
                    // Whenever Auto-Cards is inactive, remove auto card title headers from contextualized story card entries
                    text = (text
                        .replace(/\s*{\s*titles?\s*:[\s\S]*?}\s*/gi, "\n\n")
                        .replace(/World\s*Lore\s*:\s*/i, "World Lore:\n")
                    );
                    // Otherwise, implement a more complex version of this step within the (HOOK === "context") scope of AutoCards
                }
            }
            CODOMAIN.initialize(null);
        } else {
            // AutoCards was (probably) called without arguments, return an external API to allow other script creators to programmatically govern the behavior of Auto-Cards from elsewhere within their own scripts
            CODOMAIN.initialize({API: O.f(Object.fromEntries(Object.entries({
                // Call these API functions like so: AutoCards().API.nameOfFunction(argumentsOfFunction)
                /*** Postpones internal Auto-Cards events for a specified number of turns
                * 
                * @function
                * @param {number} turns A non-negative integer representing the number of turns to postpone events
                * @returns {Object} An object containing cooldown values affected by the postponement
                * @throws {Error} If turns is not a non-negative integer
                */
                postponeEvents: function(turns) {
                    if (Number.isInteger(turns) && (0 <= turns)) {
                        AC.chronometer.postpone = turns;
                    } else {
                        throw new Error(
                            "Invalid argument: \"" + turns + "\" -> AutoCards().API.postponeEvents() must be be called with a non-negative integer"
                        );
                    }
                    return {
                        postponeAllCooldown: turns,
                        addCardRealCooldown: AC.generation.cooldown,
                        addCardNextCooldown: AC.config.addCardCooldown
                    };
                },
                /*** Sets or clears the emergency halt flag to pause Auto-Cards operations
                * 
                * @function
                * @param {boolean} shouldHalt A boolean value indicating whether to engage (true) or disengage (false) emergency halt
                * @returns {boolean} The value that was set
                * @throws {Error} If called with a non-boolean argument
                */
                emergencyHalt: function(shouldHalt) {
                    if (typeof shouldHalt !== "boolean") {
                        throw new Error(
                            "Invalid argument: \"" + shouldHalt + "\" -> AutoCards().API.emergencyHalt() must be called with a boolean true or false"
                        );
                    }
                    AC.signal.emergencyHalt = shouldHalt;
                    return shouldHalt;
                },
                /*** Enables or disables state.message assignments from Auto-Cards
                * 
                * @function
                * @param {boolean} shouldSuppress If true, suppresses all Auto-Cards messages; false enables them
                * @returns {Array} The current pending messages after setting suppression
                * @throws {Error} If shouldSuppress is not a boolean
                */
                suppressMessages: function(shouldSuppress) {
                    if (typeof shouldSuppress === "boolean") {
                        AC.message.suppress = shouldSuppress;
                    } else {
                        throw new Error(
                            "Invalid argument: \"" + shouldSuppress + "\" -> AutoCards().API.suppressMessages() must be called with a boolean true or false"
                        );
                    }
                    return AC.message.pending;
                },
                /*** Toggles Auto-Cards behavior or sets it directly
                * 
                * @function
                * @param {boolean|null|undefined} toggleType If undefined, toggles the current state. If boolean or null, sets the state accordingly
                * @returns {boolean|null|undefined} The state that was set or inferred
                * @throws {Error} If toggleType is not a boolean, null, or undefined
                */
                toggle: function(toggleType) {
                    if (toggleType === undefined) {
                        if (AC.signal.forceToggle !== null) {
                            AC.signal.forceToggle = !AC.signal.forceToggle;
                        } else if (AC.config.doAC) {
                            AC.signal.forceToggle = false;
                        } else {
                            AC.signal.forceToggle = true;
                        }
                    } else if ((toggleType === null) || (typeof toggleType === "boolean")) {
                        AC.signal.forceToggle = toggleType;
                    } else {
                        throw new Error(
                            "Invalid argument: \"" + toggleType + "\" -> AutoCards().API.toggle() must be called with either A) a boolean true or false, B) a null argument, or C) no arguments at all (undefined)"
                        );
                    }
                    return toggleType;
                },
                /*** Generates a new card using optional prompt details or a request object
                * 
                * @function
                * @param {Object|string} request A request object with card parameters or a string representing the title
                * @param {string} [extra1] Optional entryPromptDetails if using string mode
                * @param {string} [extra2] Optional entryStart if using string mode
                * @returns {boolean} Did the generation attempt succeed or fail
                * @throws {Error} If the request is not valid or missing a title
                */
                generateCard: function(request, extra1, extra2) {
                    // Function call guide:
                    // AutoCards().API.generateCard({
                    //     // All properties except 'title' are optional
                    //     type: "card type, defaults to 'class' for ease of filtering",
                    //     title: "card title",
                    //     keysStart: "preexisting card triggers",
                    //     entryStart: "preexisting card entry",
                    //     entryPrompt: "prompt the AI will use to complete this entry",
                    //     entryPromptDetails: "extra details to include with this card's prompt",
                    //     entryLimit: 750, // target character count for the generated entry
                    //     description: "card notes",
                    //     memoryStart: "preexisting card memory",
                    //     memoryUpdates: true, // card updates when new relevant memories are formed
                    //     memoryLimit: 2750, // max characters before the card memory is compressed
                    // });
                    if (typeof request === "string") {
                        request = {title: request};
                        if (typeof extra1 === "string") {
                            request.entryPromptDetails = extra1;
                            if (typeof extra2 === "string") {
                                request.entryStart = extra2;
                            }
                        }
                    } else if (!isTitleInObj(request)) {
                        throw new Error(
                            "Invalid argument: \"" + request + "\" -> AutoCards().API.generateCard() must be called with either 1, 2, or 3 strings OR a correctly formatted card generation object"
                        );
                    }
                    O.f(request);
                    Internal.getUsedTitles(true);
                    return Internal.generateCard(request);
                },
                /*** Regenerates a card by title or object reference, optionally preserving or modifying its input info
                *
                * @function
                * @param {Object|string} request A card object reference or title string for the card to be regenerated
                * @param {boolean} [useOldInfo=true] If true, preserves old info in the new generation; false omits it
                * @param {string} [newInfo=""] Additional info to append to the generation prompt
                * @returns {boolean} True if regeneration succeeded; false otherwise
                * @throws {Error} If the request format is invalid, or if the second or third parameters are the wrong types
                */
                redoCard: function(request, useOldInfo = true, newInfo = "") {
                    if (typeof request === "string") {
                        request = {title: request};
                    } else if (!isTitleInObj(request)) {
                        throw new Error(
                            "Invalid argument: \"" + request + "\" -> AutoCards().API.redoCard() must be called with a string or correctly formatted card generation object"
                        );
                    }
                    if (typeof useOldInfo !== "boolean") {
                        throw new Error(
                            "Invalid argument: \"" + request + ", " + useOldInfo + "\" -> AutoCards().API.redoCard() requires a boolean as its second argument"
                        );
                    } else if (typeof newInfo !== "string") {
                        throw new Error(
                            "Invalid argument: \"" + request + ", " + useOldInfo + ", " + newInfo + "\" -> AutoCards().API.redoCard() requires a string for its third argument"
                        );
                    }
                    return Internal.redoCard(request, useOldInfo, newInfo);
                },
                /*** Flags or unflags a card as an auto-card, controlling its automatic generation behavior
                *
                * @function
                * @param {Object|string} targetCard The card object or title to mark/unmark as an auto-card
                * @param {boolean} [setOrUnset=true] If true, marks the card as an auto-card; false removes the flag
                * @returns {boolean} True if the operation succeeded; false if the card was invalid or already matched the target state
                * @throws {Error} If the arguments are invalid types
                */
                setCardAsAuto: function(targetCard, setOrUnset = true) {
                    if (isTitleInObj(targetCard)) {
                        targetCard = targetCard.title;
                    } else if (typeof targetCard !== "string") {
                        throw new Error(
                            "Invalid argument: \"" + targetCard + "\" -> AutoCards().API.setCardAsAuto() must be called with a string or card object"
                        );
                    }
                    if (typeof setOrUnset !== "boolean") {
                        throw new Error(
                            "Invalid argument: \"" + targetCard + ", " + setOrUnset + "\" -> AutoCards().API.setCardAsAuto() requires a boolean as its second argument"
                        );
                    }
                    const [card, isAuto] = getIntendedCard(targetCard);
                    if (card === null) {
                        return false;
                    }
                    if (setOrUnset) {
                        if (checkAuto()) {
                            return false;
                        }
                        card.description = "{title:}";
                        Internal.getUsedTitles(true);
                        return card.entry.startsWith("{title: ");
                    } else if (!checkAuto()) {
                        return false;
                    }
                    card.entry = removeAutoProps(card.entry);
                    card.description = removeAutoProps(card.description.replace((
                        /\s*Auto(?:-|\s*)Cards\s*will\s*contextualize\s*these\s*memories\s*:\s*/gi
                    ), ""));
                    function checkAuto() {
                        return (isAuto || /{updates: (?:true|false), limit: \d+}/.test(card.description));
                    }
                    return true;
                },
                /*** Appends a memory to a story card's memory bank
                *
                * @function
                * @param {Object|string} targetCard A card object reference or title string
                * @param {string} newMemory The memory text to add
                * @returns {boolean} True if the memory was added; false if it was empty, already present, or the card was not found
                * @throws {Error} If the inputs are not a string or valid card object reference
                */
                addCardMemory: function(targetCard, newMemory) {
                    if (isTitleInObj(targetCard)) {
                        targetCard = targetCard.title;
                    } else if (typeof targetCard !== "string") {
                        throw new Error(
                            "Invalid argument: \"" + targetCard + "\" -> AutoCards().API.addCardMemory() must be called with a string or card object"
                        );
                    }
                    if (typeof newMemory !== "string") {
                        throw new Error(
                            "Invalid argument: \"" + targetCard + ", " + newMemory + "\" -> AutoCards().API.addCardMemory() requires a string for its second argument"
                        );
                    }
                    newMemory = newMemory.trim().replace(/\s+/g, " ").replace(/^-+\s*/, "");
                    if (newMemory === "") {
                        return false;
                    }
                    const [card, isAuto, titleKey] = getIntendedCard(targetCard);
                    if (
                        (card === null)
                        || card.description.replace(/\s+/g, " ").toLowerCase().includes(newMemory.toLowerCase())
                    ) {
                        return false;
                    } else if (card.description !== "") {
                        card.description += "\n";
                    }
                    card.description += "- " + newMemory;
                    if (titleKey in AC.database.memories.associations) {
                        AC.database.memories.associations[titleKey][1] = (StringsHashed
                            .deserialize(AC.database.memories.associations[titleKey][1], 65536)
                            .remove(newMemory)
                            .add(newMemory)
                            .latest(3500)
                            .serialize()
                        );
                    } else if (isAuto) {
                        AC.database.memories.associations[titleKey] = [999, (new StringsHashed(65536)
                            .add(newMemory)
                            .serialize()
                        )];
                    }
                    return true;
                },
                /*** Removes all previously generated auto-cards and resets various states
                *
                * @function
                * @returns {number} The number of cards that were removed
                */
                eraseAllAutoCards: function() {
                    return Internal.eraseAllAutoCards();
                },
                /*** Retrieves an array of titles currently used by the adventure's story cards
                *
                * @function
                * @returns {Array<string>} An array of strings representing used titles
                */
                getUsedTitles: function() {
                    return Internal.getUsedTitles(true);
                },
                /*** Retrieves an array of banned titles
                *
                * @function
                * @returns {Array<string>} An array of banned title strings
                */
                getBannedTitles: function() {
                    return Internal.getBannedTitles();
                },
                /*** Sets the banned titles array, replacing any previously banned titles
                *
                * @function
                * @param {string|Array<string>} titles A comma-separated string or array of strings representing titles to ban
                * @returns {Object} An object containing oldBans and newBans arrays
                * @throws {Error} If the input is neither a string nor an array of strings
                */
                setBannedTitles: function(titles) {
                    const codomain = {oldBans: AC.database.titles.banned};
                    if (Array.isArray(titles) && titles.every(title => (typeof title === "string"))) {
                        assignBannedTitles(titles);
                    } else if (typeof titles === "string") {
                        if (titles.includes(",")) {
                            assignBannedTitles(titles.split(","));
                        } else {
                            assignBannedTitles([titles]);
                        }
                    } else {
                        throw new Error(
                            "Invalid argument: \"" + titles + "\" -> AutoCards().API.setBannedTitles() must be called with either a string or an array of strings"
                        );
                    }
                    codomain.newBans = AC.database.titles.banned;
                    function assignBannedTitles(titles) {
                        Internal.setBannedTitles(uniqueTitlesArray(titles), false);
                        AC.signal.overrideBans = 3;
                        return;
                    }
                    return codomain;
                },
                /*** Creates a new story card with the specified parameters
                *
                * @function
                * @param {string|Object} title Card title string or full card template object containing all fields
                * @param {string} [entry] The entry text for the card
                * @param {string} [type] The card type (e.g., "character", "location")
                * @param {string} [keys] The keys (triggers) for the card
                * @param {string} [description] The notes or memory bank of the card
                * @param {number} [insertionIndex] Optional index to insert the card at a specific position within storyCards
                * @returns {Object|null} The created card object reference, or null if creation failed
                */
                buildCard: function(title, entry, type, keys, description, insertionIndex) {
                    if (isTitleInObj(title)) {
                        type = title.type ?? type;
                        keys = title.keys ?? keys;
                        entry = title.entry ?? entry;
                        description = title.description ?? description;
                        title = title.title;
                    }
                    title = cast(title);
                    const card = constructCard(O.f({
                        type: cast(type, AC.config.defaultCardType),
                        title,
                        keys: cast(keys, buildKeys("", title)),
                        entry: cast(entry),
                        description: cast(description)
                    }), boundInteger(0, insertionIndex, storyCards.length, newCardIndex()));
                    if (notEmptyObj(card)) {
                        return card;
                    }
                    function cast(value, fallback = "") {
                        if (typeof value === "string") {
                            return value;
                        } else {
                            return fallback;
                        }
                    }
                    return null;
                },
                /*** Finds and returns story cards satisfying a user-defined condition
                *
                * @function
                * @param {Function} predicate A function which takes a card and returns true if it matches
                * @param {boolean} [getAll=false] If true, returns all matching cards; otherwise returns the first match
                * @returns {Object|Array<Object>|null} A single card object reference, an array of cards, or null if no match is found
                * @throws {Error} If the predicate is not a function or getAll is not a boolean
                */
                getCard: function(predicate, getAll = false) {
                    if (typeof predicate !== "function") {
                        throw new Error(
                            "Invalid argument: \"" + predicate + "\" -> AutoCards().API.getCard() must be called with a function"
                        );
                    } else if (typeof getAll !== "boolean") {
                        throw new Error(
                            "Invalid argument: \"" + predicate + ", " + getAll + "\" -> AutoCards().API.getCard() requires a boolean as its second argument"
                        );
                    }
                    return Internal.getCard(predicate, getAll);
                },
                /*** Removes story cards based on a user-defined condition or by direct reference
                *
                * @function
                * @param {Function|Object} predicate A predicate function or a card object reference
                * @param {boolean} [eraseAll=false] If true, removes all matching cards; otherwise removes the first match
                * @returns {boolean|number} True if a single card was removed, false if none matched, or the number of cards erased
                * @throws {Error} If the inputs are not a valid predicate function, card object, or boolean
                */
                eraseCard: function(predicate, eraseAll = false) {
                    if (isTitleInObj(predicate) && storyCards.includes(predicate)) {
                        return eraseCard(predicate);
                    } else if (typeof predicate !== "function") {
                        throw new Error(
                            "Invalid argument: \"" + predicate + "\" -> AutoCards().API.eraseCard() must be called with a function or card object"
                        );
                    } else if (typeof eraseAll !== "boolean") {
                        throw new Error(
                            "Invalid argument: \"" + predicate + ", " + eraseAll + "\" -> AutoCards().API.eraseCard() requires a boolean as its second argument"
                        );
                    } else if (eraseAll) {
                        // Erase all cards which satisfy the given condition
                        let cardsErased = 0;
                        for (const [index, card] of storyCards.entries()) {
                            if (predicate(card)) {
                                removeStoryCard(index);
                                cardsErased++;
                            }
                        }
                        return cardsErased;
                    }
                    // Erase the first card which satisfies the given condition
                    for (const [index, card] of storyCards.entries()) {
                        if (predicate(card)) {
                            removeStoryCard(index);
                            return true;
                        }
                    }
                    return false;
                }
            }).map(([key, fn]) => [key, function(...args) {
                const result = fn.apply(this, args);
                if (data) {
                    data.description = JSON.stringify(AC);
                }
                return result;
            }])))});
            function isTitleInObj(obj) {
                return (
                    (typeof obj === "object")
                    && (obj !== null)
                    && ("title" in obj)
                    && (typeof obj.title === "string")
                );
            }
        }
    } else if (AC.signal.emergencyHalt) {
        switch(HOOK) {
        case "context": {
            // AutoCards was called within the context modifier
            advanceChronometer();
            break; }
        case "output": {
            // AutoCards was called within the output modifier
            concludeEmergency();
            const previousAction = readPastAction(0);
            if (isDoSayStory(previousAction.type) && /escape\s*emergency\s*halt/i.test(previousAction.text)) {
                AC.signal.emergencyHalt = false;
            }
            break; }
        }
        CODOMAIN.initialize(TEXT);
    } else if (CONFIG.enabled) {
        // Auto-Cards is currently enabled
        // "text" represents the original text which was present before any scripts were executed
        // "TEXT" represents the script-modified version of "text" which AutoCards was called with
        // This dual scheme exists to ensure Auto-Cards is safely compatible with other scripts
        switch(HOOK) {
        case "input": {
            // AutoCards was called within the input modifier
            if (NARRATIVE_GUIDANCE.ENABLED) {
                if (state.heat == undefined){
                    state.heat = NARRATIVE_GUIDANCE.initialHeatValue
                    state.cooldownMode = false
                    state.overheatMode = false
                }
                if (state.storyTemperature == undefined){
                    state.storyTemperature = NARRATIVE_GUIDANCE.initialTemperatureValue
                }
                const lowerText = TEXT.toLowerCase()
                const words = lowerText.split(/\s+/)
                let conflictCount = 0
                let calmingCount = 0

                words.forEach(word => {
                    const fixedWord = word.replace(/^[^\w]+|[^\w]+$/g, '')
                    if (NARRATIVE_GUIDANCE.conflictWords.includes(fixedWord)) {
                    conflictCount++
                    }
                    if (NARRATIVE_GUIDANCE.calmingWords.includes(fixedWord)) {
                    calmingCount++
                    }
                })

                if (state.cooldownMode == false){
                    if (conflictCount > 0) {
                        state.heat += conflictCount * NARRATIVE_GUIDANCE.playerIncreaseHeatImpact
                        if (conflictCount >= NARRATIVE_GUIDANCE.threshholdPlayerIncreaseTemperature){
                            state.storyTemperature += conflictCount * NARRATIVE_GUIDANCE.playerIncreaseTemperatureImpact
                            log(`Detected ${conflictCount} conflict words (Player). Increasing heat & temperature.`)
                        }
                        else{
                            log(`Detected ${conflictCount} conflict words (Player). Increasing heat.`)
                        }
                    }

                    if (calmingCount > 0) {
                        state.heat -= calmingCount * NARRATIVE_GUIDANCE.playerDecreaseHeatImpact
                        if (calmingCount >= NARRATIVE_GUIDANCE.threshholdPlayerDecreaseTemperature){
                            state.storyTemperature -= calmingCount * NARRATIVE_GUIDANCE.playerDecreaseTemperatureImpact
                            log(`Detected ${calmingCount} calming words (Player). Decreasing heat & temperature.`)
                        }
                        else{
                            log(`Detected ${calmingCount} calming words (Player). Decreasing heat.`)
                        }
                    }
                }

                state.chance = randomint(1, 100)
                if (state.chance <= NARRATIVE_GUIDANCE.randomExplosionChance){
                    state.heat = state.heat + NARRATIVE_GUIDANCE.randomExplosionHeatIncreaseValue
                    state.storyTemperature = state.storyTemperature + NARRATIVE_GUIDANCE.randomExplosionTemperatureIncreaseValue
                    log("!WARNING! Explosion Occured! (+" + NARRATIVE_GUIDANCE.randomExplosionHeatIncreaseValue + " heat) (+" + NARRATIVE_GUIDANCE.randomExplosionTemperatureIncreaseValue + " temperature)")
                }
                if(state.cooldownMode == false && state.overheatMode == false){
                    state.heat = state.heat + NARRATIVE_GUIDANCE.heatIncreaseValue
                    log("Heat: " + state.heat)
                }
                state.chance = randomint(1, NARRATIVE_GUIDANCE.temperatureIncreaseChance)
                if (state.chance <= state.heat){
                    state.heat = 0
                    state.storyTemperature = state.storyTemperature + NARRATIVE_GUIDANCE.temperatureIncreaseValue
                    log("Temperature Increased. Temperature is now " + state.storyTemperature)
                }
                if (state.storyTemperature >= NARRATIVE_GUIDANCE.maximumTemperature){
                    if (state.cooldownMode == false && state.overheatMode == false){
                    state.overheatMode = true
                    state.overheatTurnsLeft = NARRATIVE_GUIDANCE.overheatTimer
                    log("Overheat Mode Activated")
                    }
                }
                if (state.cooldownMode == true){
                    state.cooldownTurnsLeft --
                    log("Cooldown Timer: " + state.cooldownTurnsLeft)
                    state.storyTemperature = state.storyTemperature - NARRATIVE_GUIDANCE.cooldownRate
                    if(state.cooldownTurnsLeft <= 0){
                    state.cooldownMode = false
                    log("Cooldown Mode Disabled")
                    }
                }
                else{
                    if(state.overheatMode == true){
                        if (NARRATIVE_GUIDANCE.smartOverheatTimer) {
                            if (calmingCount >= NARRATIVE_GUIDANCE.smartOverheatThreshold) {
                                state.storyTemperature = state.storyTemperature - NARRATIVE_GUIDANCE.overheatReductionForTemperature
                                state.heat = state.heat - NARRATIVE_GUIDANCE.overheatReductionForHeat
                                state.overheatMode = false
                                state.cooldownMode = true
                                state.cooldownTurnsLeft = NARRATIVE_GUIDANCE.cooldownTimer
                                log("Cooldown Mode Activated")
                            }
                        } else {
                            state.overheatTurnsLeft --
                            log("Overheat Timer: " + state.overheatTurnsLeft)
                            if (state.overheatTurnsLeft <= 0){
                                state.storyTemperature = state.storyTemperature - NARRATIVE_GUIDANCE.overheatReductionForTemperature
                                state.heat = state.heat - NARRATIVE_GUIDANCE.overheatReductionForHeat
                                state.overheatMode = false
                                state.cooldownMode = true
                                state.cooldownTurnsLeft = NARRATIVE_GUIDANCE.cooldownTimer
                                log("Cooldown Mode Activated")
                            }
                        }
                    }
                }

                if (state.storyTemperature > NARRATIVE_GUIDANCE.trueMaximumTemperature){
                    state.storyTemperature = NARRATIVE_GUIDANCE.trueMaximumTemperature
                    log("Temperature over maximum, recalibrating...")
                }
                if (state.storyTemperature <= 0){
                    state.storyTemperature = 1
                    log("Temperature under minimum, recalibrating...")
                }

                if (state.cooldownMode == false){
                    for (const temp of NARRATIVE_GUIDANCE.temperatureMap) {
                        if (state.storyTemperature <= temp.threshold) {
                            state.memory.authorsNote = temp.prompt + NARRATIVE_GUIDANCE.originalAuthorsNote;
                            break;
                        }
                    }
                } else {
                    if (state.storyTemperature <= 1) {
                        state.cooldownMode = false
                    }
                    else {
                        for (const temp of NARRATIVE_GUIDANCE.cooldownTemperatureMap) {
                            if (state.storyTemperature <= temp.threshold) {
                                state.memory.authorsNote = temp.prompt + NARRATIVE_GUIDANCE.originalAuthorsNote;
                                break;
                            }
                        }
                    }
                }
                state.authorsNoteStorage = state.memory.authorsNote;
            }

            if ((AC.config.deleteAllAutoCards === false) && /CONFIRM\s*DELETE/i.test(TEXT)) {
                CODOMAIN.initialize("CONFIRM DELETE -> Success!");
            } else if (TEXT.startsWith(" ") && readPastAction(0).text.endsWith("\n")) {
                // Just a simple little formatting bugfix for regular AID story actions
                CODOMAIN.initialize(getPrecedingNewlines() + TEXT.replace(/^\s+/, ""));
            } else {
                CODOMAIN.initialize(TEXT);
            }
            break; }
        case "context": {
            // AutoCards was called within the context modifier
            advanceChronometer();
            if (0 < AC.chronometer.postpone) {
                CODOMAIN.initialize(TEXT);
                break;
            }
            // Fully implement Auto-Cards onContext
            const forceStep = AC.signal.recheckRetryOrErase;
            const currentTurn = getTurn();
            // Create inventory card if it doesn't exist
            let inventoryCard = Internal.getCard(card => card.title === "Inventory");
            if (!inventoryCard) {
                inventoryCard = Internal.buildCard("Inventory", "You are carrying:", "inventory");
                AC.generation.pending.push(O.s({
                    generationType: 'starting_inventory',
                    title: "Starting Inventory",
                    prompt: Internal.generateStartingInventory(),
                }));
            }
            Internal.getUsedTitles();
            for (const titleKey in AC.database.memories.associations) {
                if (isAuto(titleKey)) {
                    // Reset the lifespan counter
                    AC.database.memories.associations[titleKey][0] = 999;
                } else if (AC.database.memories.associations[titleKey][0] < 1) {
                    // Forget this set of memory associations
                    delete AC.database.memories.associations[titleKey];
                } else if (!isAwaitingGeneration()) {
                    // Decrement the lifespan counter
                    AC.database.memories.associations[titleKey][0]--;
                }
            }
            // This copy of TEXT may be mutated
            let context = TEXT;
            const titleHeaderPatternGlobal = /\s*{\s*titles?\s*:\s*([\s\S]*?)\s*}\s*/gi;
            // Card events govern the parsing of memories from raw context as well as card memory bank injection
            const cardEvents = (function() {
                // Extract memories from the initial text (not TEXT as called from within the context modifier!)
                const contextMemories = (function() {
                    const memoriesMatch = text.match(/Memories\s*:\s*([\s\S]*?)\s*(?:Recent\s*Story\s*:|$)/i);
                    if (!memoriesMatch) {
                        return new Set();
                    }
                    const uniqueMemories = new Set(isolateMemories(memoriesMatch[1]));
                    if (uniqueMemories.size === 0) {
                        return uniqueMemories;
                    }
                    const duplicatesHashed = StringsHashed.deserialize(AC.database.memories.duplicates, 65536);
                    const duplicateMemories = new Set();
                    const seenMemories = new Set();
                    for (const memoryA of uniqueMemories) {
                        if (duplicatesHashed.has(memoryA)) {
                            // Remove to ensure the insertion order for this duplicate changes
                            duplicatesHashed.remove(memoryA);
                            duplicateMemories.add(memoryA);
                        } else if ((function() {
                            for (const memoryB of seenMemories) {
                                if (0.42 < similarityScore(memoryA, memoryB)) {
                                    // This memory is too similar to another memory
                                    duplicateMemories.add(memoryA);
                                    return false;
                                }
                            }
                            return true;
                        })()) {
                            seenMemories.add(memoryA);
                        }
                    }
                    if (0 < duplicateMemories.size) {
                        // Add each near duplicate's hashcode to AC.database.memories.duplicates
                        // Then remove duplicates from uniqueMemories and the context window
                        for (const duplicate of duplicateMemories) {
                            duplicatesHashed.add(duplicate);
                            uniqueMemories.delete(duplicate);
                            context = context.replaceAll("\n" + duplicate, "");
                        }
                        // Only the 2000 most recent duplicate memory hashcodes are remembered
                        AC.database.memories.duplicates = duplicatesHashed.latest(2000).serialize();
                    }
                    return uniqueMemories;
                })();
                const leftBoundary = "^|\\s|\"|'|—|\\(|\\[|{";
                const rightBoundary = "\\s|\\.|\\?|!|,|;|\"|'|—|\\)|\\]|}|$";
                // Murder, homicide if you will, nothing to see here
                const theKiller = new RegExp("(?:" + leftBoundary + ")the[\\s\\S]*$", "i");
                const peerageKiller = new RegExp((
                    "(?:" + leftBoundary + ")(?:" + Words.peerage.join("|") + ")(?:" + rightBoundary + ")"
                ), "gi");
                const events = new Map();
                for (const contextMemory of contextMemories) {
                    for (const titleKey of auto) {
                        if (!(new RegExp((
                            "(?<=" + leftBoundary + ")" + (titleKey
                                .replace(theKiller, "")
                                .replace(peerageKiller, "")
                                .replace(/[.*+?^${}()|[\]\\]/g, "\\$&")
                            ) + "(?=" + rightBoundary + ")"
                        ), "i")).test(contextMemory)) {
                            continue;
                        }
                        // AC card titles found in active memories will promote card events
                        if (events.has(titleKey)) {
                            events.get(titleKey).pendingMemories.push(contextMemory);
                            continue;
                        }
                        events.set(titleKey, O.s({
                            pendingMemories: [contextMemory],
                            titleHeader: ""
                        }));
                    }
                }
                const titleHeaderMatches = [...context.matchAll(titleHeaderPatternGlobal)];
                for (const [titleHeader, title] of titleHeaderMatches) {
                    if (!isAuto(title)) {
                        continue;
                    }
                    // Unique title headers found in context will promote card events
                    const titleKey = title.toLowerCase();
                    if (events.has(titleKey)) {
                        events.get(titleKey).titleHeader = titleHeader;
                        continue;
                    }
                    events.set(titleKey, O.s({
                        pendingMemories: [],
                        titleHeader: titleHeader
                    }));
                }
                return events;
            })();
            // Remove auto card title headers from active story card entries and contextualize their respective memory banks
            // Also handle the growth and maintenance of card memory banks
            let isRemembering = false;
            for (const card of storyCards) {
                // Iterate over each card to handle pending card events and forenames/surnames
                const titleHeaderMatcher = /^{title: \s*([\s\S]*?)\s*}/;
                let breakForCompression = isPendingCompression();
                if (breakForCompression) {
                    break;
                } else if (!card.entry.startsWith("{title: ")) {
                    continue;
                } else if (exceedsMemoryLimit()) {
                    const titleHeaderMatch = card.entry.match(titleHeaderMatcher);
                    if (titleHeaderMatch && isAuto(titleHeaderMatch[1])) {
                        prepareMemoryCompression(titleHeaderMatch[1].toLowerCase());
                        break;
                    }
                }
                // Handle card events
                const lowerEntry = card.entry.toLowerCase();
                for (const titleKey of cardEvents.keys()) {
                    if (!lowerEntry.startsWith("{title: " + titleKey + "}")) {
                        continue;
                    }
                    const cardEvent = cardEvents.get(titleKey);
                    if (
                        (0 < cardEvent.pendingMemories.length)
                        && /{\s*updates?\s*:\s*true\s*,\s*limits?\s*:[\s\S]*?}/i.test(card.description)
                    ) {
                        // Add new card memories
                        const associationsHashed = (function() {
                            if (titleKey in AC.database.memories.associations) {
                                return StringsHashed.deserialize(AC.database.memories.associations[titleKey][1], 65536);
                            } else {
                                AC.database.memories.associations[titleKey] = [999, ""];
                                return new StringsHashed(65536);
                            }
                        })();
                        const oldMemories = isolateMemories(extractCardMemories().text);
                        for (let i = 0; i < cardEvent.pendingMemories.length; i++) {
                            if (associationsHashed.has(cardEvent.pendingMemories[i])) {
                                // Remove first to alter the insertion order
                                associationsHashed.remove(cardEvent.pendingMemories[i]);
                            } else if (!oldMemories.some(oldMemory => (
                                (0.8 < similarityScore(oldMemory, cardEvent.pendingMemories[i]))
                            ))) {
                                // Ensure no near-duplicate memories are appended
                                card.description += "\n- " + cardEvent.pendingMemories[i];
                            }
                            associationsHashed.add(cardEvent.pendingMemories[i]);
                        }
                        AC.database.memories.associations[titleKey][1] = associationsHashed.latest(3500).serialize();
                        if (associationsHashed.size() === 0) {
                            delete AC.database.memories.associations[titleKey];
                        }
                        if (exceedsMemoryLimit()) {
                            breakForCompression = prepareMemoryCompression(titleKey);
                            break;
                        }
                    }
                    if (cardEvent.titleHeader !== "") {
                        // Replace this card's title header in context
                        const cardMemoriesText = extractCardMemories().text;
                        if (cardMemoriesText === "") {
                            // This card contains no card memories to contextualize
                            context = context.replace(cardEvent.titleHeader, "\n\n");
                        } else {
                            // Insert card memories within context and ensure they occur uniquely
                            const cardMemories = cardMemoriesText.split("\n").map(cardMemory => cardMemory.trim());
                            for (const cardMemory of cardMemories) {
                                if (25 < cardMemory.length) {
                                    context = (context
                                        .replaceAll(cardMemory, "<#>")
                                        .replaceAll(cardMemory.replace(/^-+\s*/, ""), "<#>")
                                    );
                                }
                            }
                            context = context.replace(cardEvent.titleHeader, (
                                "\n\n{%@MEM@%" + cardMemoriesText + "%@MEM@%}\n"
                            ));
                            isRemembering = true;
                        }
                    }
                    cardEvents.delete(titleKey);
                    break;
                }
                if (breakForCompression) {
                    break;
                }
                // Simplify auto-card titles which contain an obvious surname
                const titleHeaderMatch = card.entry.match(titleHeaderMatcher);
                if (!titleHeaderMatch) {
                    continue;
                }
                const [oldTitleHeader, oldTitle] = titleHeaderMatch;
                if (!isAuto(oldTitle)) {
                    continue;
                }
                const surname = isNamed(oldTitle, true);
                if (typeof surname !== "string") {
                    continue;
                }
                const newTitle = oldTitle.replace(" " + surname, "");
                const [oldTitleKey, newTitleKey] = [oldTitle, newTitle].map(title => title.toLowerCase());
                if (oldTitleKey === newTitleKey) {
                    continue;
                }
                // Preemptively mitigate some global state considered within the formatTitle scope
                clearTransientTitles();
                AC.database.titles.used = ["%@%"];
                [used, forenames, surnames].forEach(nameset => nameset.add("%@%"));
                // Premature optimization is the root of all evil
                const newKey = formatTitle(newTitle).newKey;
                clearTransientTitles();
                if (newKey === "") {
                    Internal.getUsedTitles();
                    continue;
                }
                if (oldTitleKey in AC.database.memories.associations) {
                    AC.database.memories.associations[newTitleKey] = AC.database.memories.associations[oldTitleKey];
                    delete AC.database.memories.associations[oldTitleKey];
                }
                if (AC.compression.titleKey === oldTitleKey) {
                    AC.compression.titleKey = newTitleKey;
                }
                card.entry = card.entry.replace(oldTitleHeader, oldTitleHeader.replace(oldTitle, newTitle));
                card.keys = buildKeys(card.keys.replaceAll(" " + surname, ""), newKey);
                Internal.getUsedTitles();
                function exceedsMemoryLimit() {
                    return ((function() {
                        const memoryLimitMatch = card.description.match(/limits?\s*:\s*(\d+)\s*}/i);
                        if (memoryLimitMatch) {
                            return validateMemoryLimit(parseInt(memoryLimitMatch[1], 10));
                        } else {
                            return AC.config.defaultMemoryLimit;
                        }
                    })() < (function() {
                        const cardMemories = extractCardMemories();
                        if (cardMemories.missing) {
                            return card.description;
                        } else {
                            return cardMemories.text;
                        }
                    })().length);
                }
                function prepareMemoryCompression(titleKey) {
                    AC.compression.oldMemoryBank = isolateMemories(extractCardMemories().text);
                    if (AC.compression.oldMemoryBank.length === 0) {
                        return false;
                    }
                    AC.compression.completed = 0;
                    AC.compression.titleKey = titleKey;
                    AC.compression.vanityTitle = cleanSpaces(card.title.trim());
                    AC.compression.responseEstimate = (function() {
                        const responseEstimate = estimateResponseLength();
                        if (responseEstimate === -1) {
                            return 1400
                        } else {
                            return responseEstimate;
                        }
                    })();
                    AC.compression.lastConstructIndex = -1;
                    AC.compression.newMemoryBank = [];
                    return true;
                }
                function extractCardMemories() {
                    const memoryHeaderMatch = card.description.match(
                        /(?<={\s*updates?\s*:[\s\S]*?,\s*limits?\s*:[\s\S]*?})[\s\S]*$/i
                    );
                    if (memoryHeaderMatch) {
                        return O.f({missing: false, text: cleanSpaces(memoryHeaderMatch[0].trim())});
                    } else {
                        return O.f({missing: true, text: ""});
                    }
                }
            }
            // Remove repeated memories plus any remaining title headers
            context = (context
                .replace(/(\s*<#>\s*)+/g, "\n")
                .replace(titleHeaderPatternGlobal, "\n\n")
                .replace(/World\s*Lore\s*:\s*/i, "World Lore:\n")
                .replace(/Memories\s*:\s*(?=Recent\s*Story\s*:|$)/i, "")
            );
            // Prompt the AI to generate a new card entry, compress an existing card's memories, or continue the story
            let isGenerating = false;
            let isCompressing = false;
            if (isPendingGeneration()) {
                promptGeneration();
            } else if (isAwaitingGeneration()) {
                AC.generation.workpiece = AC.generation.pending.shift();
                promptGeneration();
            } else if (isPendingCompression()) {
                promptCompression();
            } else if (
                (AC.chronometer.step || forceStep)
                && (0 < AC.generation.cooldown)
                && (AC.config.addCardCooldown !== 9999)
            ) {
                AC.generation.cooldown--;
            }
            if (shouldTrimContext()) {
                // Truncate context based on AC.signal.maxChars, begin by individually removing the oldest sentences from the recent story portion of the context window
                const recentStoryPattern = /Recent\s*Story\s*:\s*([\s\S]*?)(%@GEN@%|%@COM@%|\s\[\s*Author's\s*note\s*:|$)/i;
                const recentStoryMatch = context.match(recentStoryPattern);
                if (recentStoryMatch) {
                    const recentStory = recentStoryMatch[1];
                    let sentencesJoined = recentStory;
                    // Split by the whitespace chars following each sentence (without consuming)
                    const sentences = splitBySentences(recentStory);
                    // [minimum num of story sentences] = ([max chars for context] / 6) / [average chars per sentence]
                    const sentencesMinimum = Math.ceil(
                        (AC.signal.maxChars / 6) / (
                            boundInteger(1, context.length) / boundInteger(1, sentences.length)
                        )
                    ) + 1;
                    do {
                        if (sentences.length < sentencesMinimum) {
                            // A minimum of n many recent story sentences must remain
                            // Where n represents a sentence count equal to roughly 16.7% of the full context chars
                            break;
                        }
                        // Remove the first (oldest) recent story sentence
                        sentences.shift();
                        // Check if the total length exceeds the AC.signal.maxChars limit
                        sentencesJoined = sentences.join("");
                    } while (AC.signal.maxChars < (context.length - recentStory.length + sentencesJoined.length + 3));
                    // Rebuild the context with the truncated recentStory
                    context = context.replace(recentStoryPattern, "Recent Story:\n" + sentencesJoined + recentStoryMatch[2]);
                }
                if (isRemembering && shouldTrimContext()) {
                    // Next remove loaded card memories (if any) with top-down priority, one card at a time
                    do {
                        // This matcher relies on its case-sensitivity
                        const cardMemoriesMatch = context.match(/{%@MEM@%([\s\S]+?)%@MEM@%}/);
                        if (!cardMemoriesMatch) {
                            break;
                        }
                        context = context.replace(cardMemoriesMatch[0], (cardMemoriesMatch[0]
                            .replace(cardMemoriesMatch[1], "")
                            // Set the MEM tags to lowercase to avoid repeated future matches
                            .toLowerCase()
                        ));
                    } while (AC.signal.maxChars < (context.length + 3));
                }

            // Check for item acquisition and loss keywords
            const itemKeywords = {
                add: ["pick up", "buy", "find", "gain", "acquire", "obtain", "get", "take"],
                remove: ["drop", "sell", "lose", "use", "give", "destroy"]
            };
            const lowerText = text.toLowerCase();

            const plotKeywords = ["quest", "mission", "task", "goal", "clue", "objective"];
            const plotKeywordRegex = new RegExp(`(?:${plotKeywords.join("|")})\\s+((?:a|an|the)?\\s*([\\w\\s,]+(?:(?:and|\\,)\\s*[\\w\\s,]+)*))`, "gi");
            let plotMatch;
            while ((plotMatch = plotKeywordRegex.exec(lowerText)) !== null) {
                const plotTitle = plotMatch[1].trim().replace(/^(?:a|an|the)\s+/, '');
                if (plotTitle && !Internal.getCard(card => card.title.toLowerCase() === plotTitle.toLowerCase())) {
                    Internal.generateCard({
                        title: plotTitle,
                        type: 'plot',
                        keys: plotTitle,
                        entry: `{title: ${plotTitle}}`,
                        description: `{updates: true, limit: ${AC.config.defaultMemoryLimit}}`,
                        limit: AC.config.defaultEntryLimit
                    });
                }
            }

            for (const action in itemKeywords) {
                const keywordRegex = new RegExp(itemKeywords[action].join("|"), "gi");
                let match;
                while ((match = keywordRegex.exec(lowerText)) !== null) {
                    const keyword = match[0];
                    const substr = text.substring(match.index);
                    const itemRegex = new RegExp(`${keyword}\\s+((?:a|an|the)?\\s*([\\w\\s,]+(?:(?:and|\\,)\\s*[\\w\\s,]+)*))(\\s+in(?:side)?\\s+(?:the|a|an)\\s+([\\w\\s]+))?`, "i");
                    const itemMatch = substr.match(itemRegex);

                    if (itemMatch && itemMatch[1]) {
                        const itemNames = itemMatch[1].replace(/,(?=\s*(?:and|$))/g, '').split(/,|\s+and\s+/).map(name => name.trim().replace(/^(?:a|an|the)\s+/, ''));
                        const containerName = itemMatch[4] ? itemMatch[4].trim() : null;
                        for (const itemName of itemNames) {
                            if (action === "add") {
                                if (!Internal.getCard(card => card.title.toLowerCase() === itemName.toLowerCase())) {
                                    Internal.generateItemCard(itemName);
                                }
                            }
                            Internal.updateInventory(action, itemName, 1, containerName);
                        }
                    }
                }
            }
                if (shouldTrimContext()) {
                    // If the context is still too long, just trim from the beginning I guess 🤷‍♀️
                    context = context.slice(context.length - AC.signal.maxChars + 1);
                }
            }
            if (isRemembering) {
                // Card memory flags serve no further purpose
                context = (context
                    // Case-insensitivity is crucial here
                    .replace(/(?<={%@MEM@%)\s*/gi, "")
                    .replace(/\s*(?=%@MEM@%})/gi, "")
                    .replace(/{%@MEM@%%@MEM@%}\s?/gi, "")
                    .replaceAll("{%@MEM@%", "{ Memories:\n")
                    .replaceAll("%@MEM@%}", " }")
                );
            }
            if (isGenerating) {
                // Likewise for the card entry generation delimiter
                context = context.replaceAll("%@GEN@%", "");
            } else if (isCompressing) {
                // Or the (mutually exclusive) card memory compression delimiter
                context = context.replaceAll("%@COM@%", "");
            }
            CODOMAIN.initialize(context);
            function isolateMemories(memoriesText) {
                return (memoriesText
                    .split("\n")
                    .map(memory => cleanSpaces(memory.trim().replace(/^-+\s*/, "")))
                    .filter(memory => (memory !== ""))
                );
            }
            function isAuto(title) {
                return auto.has(title.toLowerCase());
            }
            function promptCompression() {
                isGenerating = false;
                const cardEntryText = (function() {
                    const card = getAutoCard(AC.compression.titleKey);
                    if (card === null) {
                        return null;
                    }
                    const entryLines = formatEntry(card.entry).trimEnd().split("\n");
                    if (Object.is(entryLines[0].trim(), "")) {
                        return "";
                    }
                    for (let i = 0; i < entryLines.length; i++) {
                        entryLines[i] = entryLines[i].trim();
                        if (/[a-zA-Z]$/.test(entryLines[i])) {
                            entryLines[i] += ".";
                        }
                        entryLines[i] += " ";
                    }
                    return entryLines.join("");
                })();
                if (cardEntryText === null) {
                    // Safety measure
                    resetCompressionProperties();
                    return;
                }
                repositionAN();
                // The "%COM%" substring serves as a temporary delimiter for later context length trucation
                context = context.trimEnd() + "\n\n" + cardEntryText + (
                    [...AC.compression.newMemoryBank, ...AC.compression.oldMemoryBank].join(" ")
                ) + "%@COM@%\n\n" + (function() {
                    const memoryConstruct = (function() {
                        if (AC.compression.lastConstructIndex === -1) {
                            for (let i = 0; i < AC.compression.oldMemoryBank.length; i++) {
                                AC.compression.lastConstructIndex = i;
                                const memoryConstruct = buildMemoryConstruct();
                                if ((
                                    (AC.config.memoryCompressionRatio / 10) * AC.compression.responseEstimate
                                ) < memoryConstruct.length) {
                                    return memoryConstruct;
                                }
                            }
                        } else {
                            // The previous card memory compression attempt produced a bad output
                            AC.compression.lastConstructIndex = boundInteger(
                                0, AC.compression.lastConstructIndex + 1, AC.compression.oldMemoryBank.length - 1
                            );
                        }
                        return buildMemoryConstruct();
                    })();
                    // Fill all %{title} placeholders
                    const precursorPrompt = insertTitle(AC.config.compressionPrompt, AC.compression.vanityTitle).trim();
                    const memoryPlaceholderPattern = /(?:[%\$]+\s*|[%\$]*){+\s*memor(y|ies)\s*}+/gi;
                    if (memoryPlaceholderPattern.test(precursorPrompt)) {
                        // Fill all %{memory} placeholders with a selection of pending old memories
                        return precursorPrompt.replace(memoryPlaceholderPattern, memoryConstruct);
                    } else {
                        // Append the partial entry to the end of context
                        return precursorPrompt + "\n\n" + memoryConstruct;
                    }
                })() + "\n\n";
                isCompressing = true;
                return;
            }
            function promptGeneration() {
                repositionAN();
                // All %{title} placeholders were already filled during this workpiece's initialization
                // The "%GEN%" substring serves as a temporary delimiter for later context length trucation
                context = context.trimEnd() + "%@GEN@%\n\n" + (function() {
                    // For context only, remove the title header from this workpiece's partially completed entry
                    const partialEntry = formatEntry(AC.generation.workpiece.entry);
                    const entryPlaceholderPattern = /(?:[%\$]+\s*|[%\$]*){+\s*entry\s*}+/gi;
                    if (entryPlaceholderPattern.test(AC.generation.workpiece.prompt)) {
                        // Fill all %{entry} placeholders with the partial entry
                        return AC.generation.workpiece.prompt.replace(entryPlaceholderPattern, partialEntry);
                    } else {
                        // Append the partial entry to the end of context
                        return AC.generation.workpiece.prompt.trimEnd() + "\n\n" + partialEntry;
                    }
                })();
                isGenerating = true;
                return;
            }
            function repositionAN() {
                // Move the Author's Note further back in context during card generation (should still be considered)
                const authorsNotePattern = /\s*(\[\s*Author's\s*note\s*:[\s\S]*\])\s*/i;
                const authorsNoteMatch = context.match(authorsNotePattern);
                if (!authorsNoteMatch) {
                    return;
                }
                const leadingSpaces = context.match(/^\s*/)[0];
                context = context.replace(authorsNotePattern, " ").trimStart();
                const recentStoryPattern = /\s*Recent\s*Story\s*:\s*/i;
                if (recentStoryPattern.test(context)) {
                    // Remove author's note from its original position and insert above "Recent Story:\n"
                    context = (context
                        .replace(recentStoryPattern, "\n\n" + authorsNoteMatch[1] + "\n\nRecent Story:\n")
                        .trimStart()
                    );
                } else {
                    context = authorsNoteMatch[1] + "\n\n" + context;
                }
                context = leadingSpaces + context;
                return;
            }
            function sortCandidates() {
                if (AC.database.titles.candidates.length < 2) {
                    return;
                }
                const turnRange = boundInteger(1, maxTurn - minTurn);
                const recencyExponent = Math.log10(turnRange) + 1.85;
                // Sort the database of available title candidates by relevance
                AC.database.titles.candidates.sort((a, b) => {
                    return relevanceScore(b) - relevanceScore(a);
                });
                function relevanceScore(candidate) {
                    // weight = (((turn - minTurn) / (maxTurn - minTurn)) + 1)^(log10(maxTurn - minTurn) + 1.85)
                    return candidate.slice(1).reduce((sum, turn) => {
                        // Apply exponential scaling to give far more weight to recent turns
                        return sum + Math.pow((
                            // The recency weight's exponent scales by log10(turnRange) + 1.85
                            // Shhh don't question it 😜
                            ((turn - minTurn) / turnRange) + 1
                        ), recencyExponent);
                    }, 0);
                }
                return;
            }
            function shouldTrimContext() {
                return (AC.signal.maxChars <= context.length);
            }
            function setCandidateTurnBounds(candidate) {
                // candidate: ["Example Title", 0, 1, 2, 3]
                minTurn = boundInteger(0, minTurn, candidate[1]);
                maxTurn = boundInteger(candidate[candidate.length - 1], maxTurn);
                return;
            }
            function disableAutoCards() {
                AC.signal.forceToggle = null;
                // Auto-Cards has been disabled
                AC.config.doAC = false;
                // Deconstruct the "Configure Auto-Cards" story card
                unbanTitle(configureCardTemplate.title);
                eraseCard(configureCard);
                // Signal the construction of "Edit to enable Auto-Cards" during the next onOutput hook
                AC.signal.swapControlCards = true;
                // Post a success message
                notify("Disabled! Use the \"Edit to enable Auto-Cards\" story card to undo");
                CODOMAIN.initialize(TEXT);
                return;
            }
            break; }
        case "output": {
            // AutoCards was called within the output modifier
            if (NARRATIVE_GUIDANCE.ENABLED) {
                const lowerText = TEXT.toLowerCase()
                const words = lowerText.split(/\s+/)
                let conflictCount = 0
                let calmingCount = 0

                words.forEach(word => {
                    const fixedWord = word.replace(/^[^\w]+|[^\w]+$/g, '')
                    if (NARRATIVE_GUIDANCE.conflictWords.includes(fixedWord)) {
                    conflictCount++
                    }
                    if (NARRATIVE_GUIDANCE.calmingWords.includes(fixedWord)) {
                    calmingCount++
                    }
                })

                if (conflictCount > 0) {
                    state.heat += conflictCount * NARRATIVE_GUIDANCE.modelIncreaseHeatImpact
                    if (conflictCount >= NARRATIVE_GUIDANCE.threshholdModelIncreaseTemperature){
                    state.storyTemperature += NARRATIVE_GUIDANCE.modelIncreaseTemperatureImpact
                    log(`Detected ${conflictCount} conflict words (AI). Increasing heat & temperature.`)
                    }
                    else{
                    log(`Detected ${conflictCount} conflict words (AI). Increasing heat.`)
                    }
                }

                if (calmingCount > 0) {
                    state.heat -= calmingCount * NARRATIVE_GUIDANCE.modelDecreaseHeatImpact
                    if (calmingCount >= NARRATIVE_GUIDANCE.threshholdModelDecreaseTemperature){
                    state.storyTemperature -= NARRATIVE_GUIDANCE.modelDecreaseTemperatureImpact
                    log(`Detected ${calmingCount} calming words (AI). Decreasing heat & temperature.`)
                    }
                    else{
                    log(`Detected ${calmingCount} calming words (AI). Decreasing heat.`)
                    }
                }

                if (state.storyTemperature > NARRATIVE_GUIDANCE.trueMaximumTemperature){
                    state.storyTemperature = NARRATIVE_GUIDANCE.trueMaximumTemperature
                    log("Temperature over maximum, recalibrating...")
                }

                if (state.storyTemperature <= 0){
                    state.storyTemperature = 1
                    log("Temperature under minimum, recalibrating...")
                }


                if (state.memory.authorsNote == NARRATIVE_GUIDANCE.originalAuthorsNote){
                    state.memory.authorsNote = state.authorsNoteStorage
                }

                log("Heat: " + state.heat)
                log("Temperature: " + state.storyTemperature)
            }
            const output = prettifyEmDashes(TEXT);
            if (0 < AC.chronometer.postpone) {
                // Do not capture or replace any outputs during this turn
                promoteAmnesia();
                if (permitOutput()) {
                    CODOMAIN.initialize(output);
                }
            } else if (AC.signal.swapControlCards) {
                if (permitOutput()) {
                    CODOMAIN.initialize(output);
                }
            } else if (isPendingGeneration()) {
                const textClone = prettifyEmDashes(text);
                AC.chronometer.amnesia = 0;
                AC.generation.completed++;
                const generationsRemaining = (function() {
                    if (
                        textClone.includes("\"")
                        || /(?<=^|\s|—|\(|\[|{)sa(ys?|id)(?=\s|\.|\?|!|,|;|—|\)|\]|}|$)/i.test(textClone)
                    ) {
                        // Discard full outputs containing "say" or quotations
                        // To build coherent entries, the AI must not attempt to continue the story
                        return skip(estimateRemainingGens());
                    }
                    const oldSentences = (splitBySentences(formatEntry(AC.generation.workpiece.entry))
                        .map(sentence => sentence.trim())
                        .filter(sentence => (2 < sentence.length))
                    );
                    const seenSentences = new Set();
                    const entryAddition = splitBySentences(textClone
                        .replace(/[\*_~]/g, "")
                        .replace(/:+/g, "#")
                        .replace(/\s+/g, " ")
                    ).map(sentence => (sentence
                        .trim()
                        .replace(/^-+\s*/, "")
                    )).filter(sentence => (
                        // Remove empty strings
                        (sentence !== "")
                        // Remove colon ":" headers or other stinky symbols because me no like 😠
                        && !/[#><@]/.test(sentence)
                        // Remove previously repeated sentences
                        && !oldSentences.some(oldSentence => (0.75 < similarityScore(oldSentence, sentence)))
                        // Remove repeated sentences from within entryAddition itself
                        && ![...seenSentences].some(seenSentence => (0.75 < similarityScore(seenSentence, sentence)))
                        // Simply ensure this sentence is henceforth unique
                        && seenSentences.add(sentence)
                    )).join(" ").trim() + " ";
                    if (entryAddition === " ") {
                        return skip(estimateRemainingGens());
                    } else if (
                        /^{title:[\s\S]*?}$/.test(AC.generation.workpiece.entry.trim())
                        && (AC.generation.workpiece.entry.length < 111)
                    ) {
                        AC.generation.workpiece.entry += "\n" + entryAddition;
                    } else {
                        AC.generation.workpiece.entry += entryAddition;
                    }
                    if (AC.generation.workpiece.limit < AC.generation.workpiece.entry.length) {
                        let exit = false;
                        let truncatedEntry = AC.generation.workpiece.entry.trimEnd();
                        const sentences = splitBySentences(truncatedEntry);
                        for (let i = sentences.length - 1; 0 <= i; i--) {
                            if (!sentences[i].includes("\n")) {
                                sentences.splice(i, 1);
                                truncatedEntry = sentences.join("").trimEnd();
                                if (truncatedEntry.length <= AC.generation.workpiece.limit) {
                                    break;
                                }
                                continue;
                            }
                            // Lines only matter for initial entries provided via AutoCards().API.generateCard
                            const lines = sentences[i].split("\n");
                            for (let j = lines.length - 1; 0 <= j; j--) {
                                lines.splice(j, 1);
                                sentences[i] = lines.join("\n");
                                truncatedEntry = sentences.join("").trimEnd();
                                if (truncatedEntry.length <= AC.generation.workpiece.limit) {
                                    // Exit from both loops
                                    exit = true;
                                    break;
                                }
                            }
                            if (exit) {
                                break;
                            }
                        }
                        if (truncatedEntry.length < 150) {
                            // Disregard the previous sentence/line-based truncation attempt
                            AC.generation.workpiece.entry = limitString(
                                AC.generation.workpiece.entry, AC.generation.workpiece.limit
                            );
                            // Attempt to remove the last word/fragment
                            truncatedEntry = AC.generation.workpiece.entry.replace(/\s*\S+$/, "");
                            if (150 <= truncatedEntry) {
                                AC.generation.workpiece.entry = truncatedEntry;
                            }
                        } else {
                            AC.generation.workpiece.entry = truncatedEntry;
                        }
                        return 0;
                    } else if ((AC.generation.workpiece.limit - 50) <= AC.generation.workpiece.entry.length) {
                        AC.generation.workpiece.entry = AC.generation.workpiece.entry.trimEnd();
                        return 0;
                    }
                    function skip(remaining) {
                        if (AC.generation.permitted <= AC.generation.completed) {
                            AC.generation.workpiece.entry = AC.generation.workpiece.entry.trimEnd();
                            return 0;
                        }
                        return remaining;
                    }
                    function estimateRemainingGens() {
                        const responseEstimate = estimateResponseLength();
                        if (responseEstimate === -1) {
                            return 1;
                        }
                        const remaining = boundInteger(1, Math.round(
                            (150 + AC.generation.workpiece.limit - AC.generation.workpiece.entry.length) / responseEstimate
                        ));
                        if (AC.generation.permitted === 34) {
                            AC.generation.permitted = boundInteger(6, Math.floor(3.5 * remaining), 32);
                        }
                        return remaining;
                    }
                    return skip(estimateRemainingGens());
                })();
                postOutputMessage(textClone, AC.generation.completed / Math.min(
                    AC.generation.permitted,
                    AC.generation.completed + generationsRemaining
                ));
                if (generationsRemaining <= 0) {
                    if (AC.generation.workpiece.generationType === 'starting_inventory') {
                        Internal.parseAndPopulateInventory(textClone);
                        let inventoryCard = Internal.getCard(card => card.title === "Inventory");
                        if (inventoryCard) {
                            inventoryCard.entry = Internal.renderInventory();
                        }
                    } else if (AC.generation.workpiece.generationType === 'item_description') {
                        notify("\"" + AC.generation.workpiece.title + "\" was successfully added to your story cards!");
                        constructCard(O.f({
                            type: AC.generation.workpiece.type,
                            title: AC.generation.workpiece.title,
                            keys: AC.generation.workpiece.keys,
                            entry: AC.generation.workpiece.entry + "\n" + textClone,
                            description: AC.generation.workpiece.description,
                        }), newCardIndex());
                    } else {
                        notify("\"" + AC.generation.workpiece.title + "\" was successfully added to your story cards!");
                        constructCard(O.f({
                            type: AC.generation.workpiece.type,
                            title: AC.generation.workpiece.title,
                        keys: AC.generation.workpiece.keys,
                        entry: (function() {
                            if (!AC.config.bulletedListMode) {
                                return AC.generation.workpiece.entry;
                            }
                            const sentences = splitBySentences(
                                formatEntry(
                                    AC.generation.workpiece.entry.replace(/\s+/g, " ")
                                ).replace(/:+/g, "#")
                            ).map(sentence => {
                                sentence = (sentence
                                    .replaceAll("#", ":")
                                    .trim()
                                    .replace(/^-+\s*/, "")
                                );
                                if (sentence.length < 12) {
                                    return sentence;
                                } else {
                                    return "\n- " + sentence.replace(/\s*[\.\?!]+$/, "");
                                }
                            });
                            const titleHeader = "{title: " + AC.generation.workpiece.title + "}";
                            if (sentences.every(sentence => (sentence.length < 12))) {
                                const sentencesJoined = sentences.join(" ").trim();
                                if (sentencesJoined === "") {
                                    return titleHeader;
                                } else {
                                    return limitString(titleHeader + "\n" + sentencesJoined, 2000);
                                }
                            }
                            for (let i = sentences.length - 1; 0 <= i; i--) {
                                const bulletedEntry = cleanSpaces(titleHeader + sentences.join(" ")).trimEnd();
                                if (bulletedEntry.length <= 2000) {
                                    return bulletedEntry;
                                }
                                if (sentences.length === 1) {
                                    break;
                                }
                                sentences.splice(i, 1);
                            }
                            return limitString(AC.generation.workpiece.entry, 2000);
                        })(),
                        description: AC.generation.workpiece.description,
                    }), newCardIndex());
                    AC.generation.cooldown = AC.config.addCardCooldown;
                    AC.generation.completed = 0;
                    AC.generation.permitted = 34;
                    AC.generation.workpiece = O.f({});
                    clearTransientTitles();
                }
            } else if (isPendingCompression()) {
                const textClone = prettifyEmDashes(text);
                AC.chronometer.amnesia = 0;
                AC.compression.completed++;
                const compressionsRemaining = (function() {
                    const newMemory = (textClone
                        // Remove some dumb stuff
                        .replace(/^[\s\S]*:/g, "")
                        .replace(/[\*_~#><@\[\]{}`\\]/g, " ")
                        // Remove bullets
                        .trim().replace(/^-+\s*/, "").replace(/\s*-+$/, "").replace(/\s*-\s+/g, " ")
                        // Condense consecutive whitespace
                        .replace(/\s+/g, " ")
                    );
                    if ((AC.compression.oldMemoryBank.length - 1) <= AC.compression.lastConstructIndex) {
                        // Terminate this compression cycle; the memory construct cannot grow any further
                        AC.compression.newMemoryBank.push(newMemory);
                        return 0;
                    } else if ((newMemory.trim() !== "") && (newMemory.length < buildMemoryConstruct().length)) {
                        // Good output, preserve and then proceed onwards
                        AC.compression.oldMemoryBank.splice(0, AC.compression.lastConstructIndex + 1);
                        AC.compression.lastConstructIndex = -1;
                        AC.compression.newMemoryBank.push(newMemory);
                    } else {
                        // Bad output, discard and then try again
                        AC.compression.responseEstimate += 200;
                    }
                    return boundInteger(1, joinMemoryBank(AC.compression.oldMemoryBank).length) / AC.compression.responseEstimate;
                })();
                postOutputMessage(textClone, AC.compression.completed / (AC.compression.completed + compressionsRemaining));
                if (compressionsRemaining <= 0) {
                    const card = getAutoCard(AC.compression.titleKey);
                    if (card === null) {
                        notify(
                            "Failed to apply summarized memories for \"" + AC.compression.vanityTitle + "\" due to a missing or invalid AC card title header!"
                        );
                    } else {
                        const memoryHeaderMatch = card.description.match(
                            /(?<={\s*updates?\s*:[\s\S]*?,\s*limits?\s*:[\s\S]*?})[\s\S]*$/i
                        );
                        if (memoryHeaderMatch) {
                            // Update the card memory bank
                            notify("Memories for \"" + AC.compression.vanityTitle + "\" were successfully summarized!");
                            card.description = card.description.replace(memoryHeaderMatch[0], (
                                "\n" + joinMemoryBank(AC.compression.newMemoryBank)
                            ));
                        } else {
                            notify(
                                "Failed to apply summarizes memories for \"" + AC.compression.vanityTitle + "\" due to a missing or invalid AC card memory header!"
                            );
                        }
                    }
                    resetCompressionProperties();
                } else if (AC.compression.completed === 1) {
                    notify("Summarizing excess memories for \"" + AC.compression.vanityTitle + "\"");
                }
                function joinMemoryBank(memoryBank) {
                    return cleanSpaces("- " + memoryBank.join("\n- "));
                }
            } else if (permitOutput()) {
                CODOMAIN.initialize(output);
            }
            concludeOutputBlock((function() {
                if (AC.signal.swapControlCards) {
                    return getConfigureCardTemplate();
                } else {
                    return null;
                }
            })())
            function postOutputMessage(textClone, ratio) {
                if (!permitOutput()) {
                    // Do nothing
                } else if (0.5 < similarityScore(textClone, output)) {
                    // To improve Auto-Cards' compatability with other scripts, I only bother to replace the output text when the original and new output texts have a similarity score above a particular threshold. Otherwise, I may safely assume the output text has already been replaced by another script and thus skip this step.
                    CODOMAIN.initialize(
                        getPrecedingNewlines() + ">>> please select \"continue\" (" + Math.round(ratio * 100) + "%) <<<\n\n"
                    );
                } else {
                    CODOMAIN.initialize(output);
                }
                return;
            }
            break; }
        default: {
            CODOMAIN.initialize(TEXT);
            break; }
        }
        // Get an individual story card reference via titleKey
        function getAutoCard(titleKey) {
            return Internal.getCard(card => card.entry.toLowerCase().startsWith("{title: " + titleKey + "}"));
        }
        function buildMemoryConstruct() {
            return (AC.compression.oldMemoryBank
                .slice(0, AC.compression.lastConstructIndex + 1)
                .join(" ")
            );
        }
        // Estimate the average AI response char count based on recent continue outputs
        function estimateResponseLength() {
            if (!Array.isArray(history) || (history.length === 0)) {
                return -1;
            }
            const charCounts = [];
            for (let i = 0; i < history.length; i++) {
                const action = readPastAction(i);
                if ((action.type === "continue") && !action.text.includes("<<<")) {
                    charCounts.push(action.text.length);
                }
            }
            if (charCounts.length < 7) {
                if (charCounts.length === 0) {
                    return -1;
                } else if (charCounts.length < 4) {
                    return boundInteger(350, charCounts[0]);
                }
                charCounts.splice(3);
            }
            return boundInteger(175, Math.floor(
                charCounts.reduce((sum, charCount) => {
                    return sum + charCount;
                }, 0) / charCounts.length
            ));
        }
        // Evalute how similar two strings are on the range [0, 1]
        function similarityScore(strA, strB) {
            if (strA === strB) {
                return 1;
            }
            // Normalize both strings for further comparison purposes
            const [cleanA, cleanB] = [strA, strB].map(str => limitString((str
                .replace(/[0-9\s]/g, " ")
                .trim()
                .replace(/  +/g, " ")
                .toLowerCase()
            ), 1400));
            if (cleanA === cleanB) {
                return 1;
            }
            // Compute the Levenshtein distance
            const [lengthA, lengthB] = [cleanA, cleanB].map(str => str.length);
            // I love DP ❤️ (dynamic programming)
            const dp = Array(lengthA + 1).fill(null).map(() => Array(lengthB + 1).fill(0));
            for (let i = 0; i <= lengthA; i++) {
                dp[i][0] = i;
            }
            for (let j = 0; j <= lengthB; j++) {
                dp[0][j] = j;
            }
            for (let i = 1; i <= lengthA; i++) {
                for (let j = 1; j <= lengthB; j++) {
                    if (cleanA[i - 1] === cleanB[j - 1]) {
                        // No cost if chars match, swipe right 😎
                        dp[i][j] = dp[i - 1][j - 1];
                    } else {
                        dp[i][j] = Math.min(
                            // Deletion
                            dp[i - 1][j] + 1,
                            // Insertion
                            dp[i][j - 1] + 1,
                            // Substitution
                            dp[i - 1][j - 1] + 1
                        );
                    }
                }
            }
            // Convert distance to similarity score (1 - (distance / maxLength))
            return 1 - (dp[lengthA][lengthB] / Math.max(lengthA, lengthB));
        }
        function splitBySentences(prose) {
            // Don't split sentences on honorifics or abbreviations such as "Mr.", "Mrs.", "etc."
            return (prose
                .replace(new RegExp("(?<=\\s|\"|\\(|—|\\[|'|{|^)(?:" + ([...Words.honorifics, ...Words.abbreviations]
                    .map(word => word.replace(".", ""))
                    .join("|")
                ) + ")\\.", "gi"), "$1%@%")
                .split(/(?<=[\.\?!:]["\)'\]}]?\s+)(?=[^\p{Ll}\s])/u)
                .map(sentence => sentence.replaceAll("%@%", "."))
            );
        }
        function formatEntry(partialEntry) {
            const cleanedEntry = cleanSpaces(partialEntry
                .replace(/^{title:[\s\S]*?}/, "")
                .replace(/[#><@*_~]/g, "")
                .trim()
            ).replace(/(?<=^|\n)-+\s*/g, "");
            if (cleanedEntry === "") {
                return "";
            } else {
                return cleanedEntry + " ";
            }
        }
        // Resolve malformed em dashes (common AI cliche)
        function prettifyEmDashes(str) {
            return str.replace(/(?<!^\s*)(?: - | ?– ?)(?!\s*$)/g, "—");
        }
    }
    function hoistConst() { return (class Const {
        #constant;
        constructor(...args) {
            O.f(this);
            return this;
        }
        declare(...args) {
            if (args.length !== 0) {
                this.constructor.#throwError([[(args.length === 1), "Instances of Const cannot be declared with a parameter"], ["Instances of Const cannot be declared with parameters"]]);
            } else if (this.#constant === undefined) {
                this.#constant = null;
                return this;
            } else if (this.#constant === null) {
                this.constructor.#throwError("Instances of Const cannot be redeclared");
            } else {
                this.constructor.#throwError("Instances of Const cannot be redeclared after initialization");
            }
        }
        initialize(...args) {
            if (args.length !== 1) {
                this.constructor.#throwError([[(args.length === 0), "Instances of Const cannot be initialized without a parameter"], ["Instances of Const cannot be initialized with multiple parameters"]]);
            } else if (this.#constant === null) {
                this.#constant = [args[0]];
                return this;
            } else if (this.#constant === undefined) {
                this.constructor.#throwError("Instances of Const cannot be initialized before declaration");
            } else {
                this.constructor.#throwError("Instances of Const cannot be reinitialized");
            }
        }
        read(...args) {
            if (args.length !== 0) {
                this.constructor.#throwError([[(args.length === 1), "Instances of Const cannot be read with a parameter"], ["Instances of Const cannot read with any parameters"]]);
            } else if (Array.isArray(this.#constant)) {
                return this.#constant[0];
            } else if (this.#constant === null) {
                this.constructor.#throwError("Despite prior declaration, instances of Const cannot be read before initialization");
            } else {
                this.constructor.#throwError("Instances of Const cannot be read before initialization");
            }
        }
        static #throwError(...args) {
            throw new Error(args.join(" "));
        }
    }); }
    function hoistO() { return (class O {
        static f(obj) {
            return Object.freeze(obj);
        }
        static v(base) {
            return see(Words.copy) + base;
        }
        static s(obj) {
            return Object.seal(obj);
        }
    }); }
    function hoistWords() { return (class Words { static #cache = {}; static {
        // Each word list is initialized only once before being cached!
        const wordListInitializers = {
            // Special-cased honorifics which are excluded from titles and ignored during split-by-sentences operations
            honorifics: () => [
                "mr.", "ms.", "mrs.", "dr."
            ],
            // Other special-cased abbreviations used to reformat titles and split-by-sentences
            abbreviations: () => [
                "sr.", "jr.", "etc.", "st.", "ex.", "inc."
            ],
            // Lowercase minor connector words which may exist within titles
            minor: () => [
                "&", "the", "for", "of", "le", "la", "el"
            ],
            // Removed from shortened titles for improved memory detection and trigger keword assignments
            peerage: () => [
                "sir", "lord", "lady", "king", "queen", "majesty", "duke", "duchess", "noble", "royal", "emperor", "empress", "great", "prince", "princess", "count", "countess", "baron", "baroness", "archduke", "archduchess", "marquis", "marquess", "viscount", "viscountess", "consort", "grand", "sultan", "sheikh", "tsar", "tsarina", "czar", "czarina", "viceroy", "monarch", "regent", "imperial", "sovereign", "president", "prime", "minister", "nurse", "doctor", "saint", "general", "private", "commander", "captain", "lieutenant", "sergeant", "admiral", "marshal", "baronet", "emir", "chancellor", "archbishop", "bishop", "cardinal", "abbot", "abbess", "shah", "maharaja", "maharani", "councillor", "squire", "lordship", "ladyship", "monseigneur", "mayor", "princeps", "chief", "chef", "their", "my", "his", "him", "he'd", "her", "she", "she'd", "you", "your", "yours", "you'd", "you've", "you'll", "yourself", "mine", "myself", "highness", "excellency", "farmer", "sheriff", "officer", "detective", "investigator", "miss", "mister", "colonel", "professor", "teacher", "agent", "heir", "heiress", "master", "mistress", "headmaster", "headmistress", "principal", "papa", "mama", "mommy", "daddy", "mother", "father", "grandma", "grandpa", "aunt", "auntie", "aunty", "uncle", "cousin", "sister", "brother", "holy", "holiness", "almighty", "senator", "congressman"
            ],
            // Unwanted values
            undesirables: () => [
                [343332, 451737, 323433, 377817], [436425, 356928, 363825, 444048], [323433, 428868, 310497, 413952], [350097, 66825, 436425, 413952, 406593, 444048], [316932, 330000, 436425, 392073], [444048, 356928, 323433], [451737, 444048, 363825], [330000, 310497, 392073, 399300]
            ],
            delimiter: () => (
                "——————————————————————————"
            ),
            // Source code location
            copy: () => [
                126852, 33792, 211200, 384912, 336633, 310497, 436425, 336633, 33792, 459492, 363825, 436425, 363825, 444048, 33792, 392073, 483153, 33792, 139425, 175857, 33792, 152592, 451737, 399300, 350097, 336633, 406593, 399300, 33792, 413952, 428868, 406593, 343332, 363825, 384912, 336633, 33792, 135168, 190608, 336633, 467313, 330000, 190608, 336633, 310497, 356928, 33792, 310497, 399300, 330000, 33792, 428868, 336633, 310497, 330000, 33792, 392073, 483153, 33792, 316932, 363825, 406593, 33792, 343332, 406593, 428868, 33792, 436425, 363825, 392073, 413952, 384912, 336633, 33792, 363825, 399300, 436425, 444048, 428868, 451737, 323433, 444048, 363825, 406593, 399300, 436425, 33792, 406593, 399300, 33792, 310497, 330000, 330000, 363825, 399300, 350097, 33792, 139425, 451737, 444048, 406593, 66825, 148137, 310497, 428868, 330000, 436425, 33792, 444048, 406593, 33792, 483153, 406593, 451737, 428868, 33792, 436425, 323433, 336633, 399300, 310497, 428868, 363825, 406593, 436425, 35937, 33792, 3355672848, 139592360193, 3300, 3300, 356928, 444048, 444048, 413952, 436425, 111012, 72897, 72897, 413952, 384912, 310497, 483153, 69828, 310497, 363825, 330000, 451737, 399300, 350097, 336633, 406593, 399300, 69828, 323433, 406593, 392073, 72897, 413952, 428868, 406593, 343332, 363825, 384912, 336633, 72897, 190608, 336633, 467313, 330000, 190608, 336633, 310497, 356928, 3300, 3300, 126852, 33792, 139425, 451737, 444048, 406593, 66825, 148137, 310497, 428868, 330000, 436425, 33792, 459492, 79233, 69828, 76032, 69828, 76032, 33792, 363825, 436425, 33792, 310497, 399300, 33792, 406593, 413952, 336633, 399300, 66825, 436425, 406593, 451737, 428868, 323433, 336633, 33792, 436425, 323433, 428868, 363825, 413952, 444048, 33792, 343332, 406593, 428868, 33792, 139425, 175857, 33792, 152592, 451737, 399300, 350097, 336633, 406593, 399300, 33792, 392073, 310497, 330000, 336633, 33792, 316932, 483153, 33792, 190608, 336633, 467313, 330000, 190608, 336633, 310497, 356928, 69828, 33792, 261393, 406593, 451737, 33792, 356928, 310497, 459492, 336633, 33792, 392073, 483153, 33792, 343332, 451737, 384912, 384912, 33792, 413952, 336633, 428868, 392073, 363825, 436425, 436425, 363825, 406593, 399300, 33792, 444048, 406593, 33792, 451737, 436425, 336633, 33792, 139425, 451737, 444048, 406593, 66825, 148137, 310497, 428868, 330000, 436425, 33792, 467313, 363825, 444048, 356928, 363825, 399300, 33792, 483153, 406593, 451737, 428868, 33792, 413952, 336633, 428868, 436425, 406593, 399300, 310497, 384912, 33792, 406593, 428868, 33792, 413952, 451737, 316932, 384912, 363825, 436425, 356928, 336633, 330000, 33792, 436425, 323433, 336633, 399300, 310497, 428868, 363825, 406593, 436425, 35937, 3300, 126852, 33792, 261393, 406593, 451737, 50193, 428868, 336633, 33792, 310497, 384912, 436425, 406593, 33792, 467313, 336633, 384912, 323433, 406593, 392073, 336633, 33792, 444048, 406593, 33792, 336633, 330000, 363825, 444048, 33792, 444048, 356928, 336633, 33792, 139425, 175857, 33792, 413952, 428868, 406593, 392073, 413952, 444048, 436425, 33792, 310497, 399300, 330000, 33792, 444048, 363825, 444048, 384912, 336633, 33792, 336633, 475200, 323433, 384912, 451737, 436425, 363825, 406593, 399300, 436425, 33792, 413952, 428868, 406593, 459492, 363825, 330000, 336633, 330000, 33792, 316932, 336633, 384912, 406593, 467313, 69828, 33792, 175857, 33792, 436425, 363825, 399300, 323433, 336633, 428868, 336633, 384912, 483153, 33792, 356928, 406593, 413952, 336633, 33792, 483153, 406593, 451737, 33792, 336633, 399300, 370788, 406593, 483153, 33792, 483153, 406593, 451737, 428868, 33792, 310497, 330000, 459492, 336633, 399300, 444048, 451737, 428868, 336633, 436425, 35937, 33792, 101128769412, 106046468352, 3300
            ],
            // Acceptable config settings which are coerced to true
            trues: () => [
                "true", "t", "yes", "y", "on"
            ],
            // Acceptable config settings which are coerced to false
            falses: () => [
                "false", "f", "no", "n", "off"
            ],
            guide: () => prose(
                ">>> Detailed Guide:",
                "",
                Words.delimiter,
                "",
                "💡 What is Auto-Cards?",
                "Auto-Cards is a plug-and-play script for AI Dungeon that watches your story and automatically writes plot-relevant story cards during normal gameplay. A forgetful AI breaks my immersion, therefore my primary goal was to address the \"object permanence problem\" by extending story cards and memories with deeper automation. Auto-Cards builds a living reference of your adventure's world as you go. For your own convenience, all of this stuff is handled in the background. Though you're certainly welcome to customize various settings for more precise control",
                "",
                Words.delimiter,
                "",
                " 📌 Main Features",
                "- Detects named entities from your story and periodically writes new cards",
                "- Smart long-term memory updates and summaries for important cards",
                "- Fully customizable AI card generation and memory summarization prompts",
                "- Free and open source for anyone to use within their own projects",
                "- Compatible with other scripts and includes an external API",
                "",
                Words.delimiter,
                "",
                "⚙️ Config Settings",
                "You may, at any time, fine-tune your settings in-game by editing their values within the config card's entry section. Simply swap true/false or tweak numbers where appropriate",
                "",
                "> Disable Auto-Cards:",
                "Turns the whole system off if true",
                "",
                "> Show detailed guide:",
                "If true, shows this player guide in-game",
                "",
                "> Delete all automatic story cards:",
                "Removes every auto-card present in your adventure",
                "",
                "> Reset all config settings and prompts:",
                "Restores all settings and prompts to their original default values",
                "",
                "> Pin this config card near the top:",
                "Keeps the config card pinned high on your cards list",
                "",
                "> Minimum turns cooldown for new cards:",
                "How many turns (minimum) to wait between generating new cards. Using 9999 will pause periodic card generation while still allowing card memory updates to continue",
                "",
                "> New cards use a bulleted list format:",
                "If true, new entries will use bullet points instead of pure prose",
                "",
                "> Maximum entry length for new cards:",
                "Caps how long newly generated card entries can be (in characters)",
                "",
                "> New cards perform memory updates:",
                "If true, new cards will automatically experience memory updates over time",
                "",
                "> Card memory bank preferred length:",
                "Character count threshold before card memories are summarized to save space",
                "",
                "> Memory summary compression ratio:",
                "Controls how much to compress when summarizing long card memory banks",
                "(ratio = 10 * old / new ... such that 25 -> 2.5x shorter)",
                "",
                "> Exclude all-caps from title detection:",
                "Prevents all-caps words like \"RUN\" from being parsed as viable titles",
                "",
                "> Also detect titles from player inputs:",
                "Allows your typed Do/Say/Story action inputs to help suggest new card topics. Set to false if you have bad grammar, or if you're German (due to idiosyncratic noun capitalization habits)",
                "",
                "> Minimum turns age for title detection:",
                "How many actions back the script looks when parsing recent titles from your story",
                "",
                Words.delimiter,
                "",
                "✏️ AI Prompts",
                "You may specify how the AI handles story card processes by editing either of these two prompts within the config card's notes section",
                "",
                "> AI prompt to generate new cards:",
                "Used when Auto-Cards writes a new card entry. It tells the AI to focus on important plot stuff, avoid fluff, and write in a consistent, polished style. I like to add some personal preferences here when playing my own adventures. \"%{title}\" and \"%{entry}\" are dynamic placeholders for their namesakes",
                "",
                "> AI prompt to summarize card memories:",
                "Summarizes older details within card memory banks to keep everything concise and neat over the long-run. Maintains only the most important details, written in the past tense. \"%{title}\" and \"%{memory}\" are dynamic placeholders for their namesakes",
                "",
                Words.delimiter,
                "",
                "⛔ Banned Titles List",
                "This list prevents new cards from being created for super generic or unhelpful titles such as North, Tuesday, or December. You may edit these at the bottom of the config card's notes section. Capitalization and plural/singular forms are handled for you, so no worries about that",
                "",
                "> Titles banned from automatic new card generation:",
                "North, East, South, West, and so on...",
                "",
                Words.delimiter,
                "",
                "🔧 External API Functions (quick summary)",
                "These are mainly for other JavaScript programmers to use, so feel free to ignore this section if that doesn't apply to you. Anyway, here's what each one does in plain terms, though please do refer to my source code for the full documentation",
                "",
                "AutoCards().API.postponeEvents();",
                "Pauses Auto-Cards activity for n many turns",
                "",
                "AutoCards().API.emergencyHalt();",
                "Emergency stop or resume",
                "",
                "AutoCards().API.suppressMessages();",
                "Hides Auto-Cards toasts by preventing assignment to state.message",
                "",
                "AutoCards().API.debugLog();",
                "Writes to the debug log card",
                "",
                "AutoCards().API.toggle();",
                "Turns Auto-Cards on/off",
                "",
                "AutoCards().API.generateCard();",
                "Initiates AI generation of the requested card",
                "",
                "AutoCards().API.redoCard();",
                "Regenerates an existing card",
                "",
                "AutoCards().API.setCardAsAuto();",
                "Flags or unflags a card as automatic",
                "",
                "AutoCards().API.addCardMemory();",
                "Adds a memory to a specific card",
                "",
                "AutoCards().API.eraseAllAutoCards();",
                "Deletes all auto-cards",
                "",
                "AutoCards().API.getUsedTitles();",
                "Lists all current card titles and keys",
                "",
                "AutoCards().API.getBannedTitles();",
                "Shows your current banned titles list",
                "",
                "AutoCards().API.setBannedTitles();",
                "Replaces the banned titles list with a new list",
                "",
                "AutoCards().API.buildCard();",
                "Makes a new card from scratch, using exact parameters",
                "",
                "AutoCards().API.getCard();",
                "Finds cards that match a filter",
                "",
                "AutoCards().API.eraseCard();",
                "Deletes cards matching a filter",
                "",
                Words.delimiter,
                "",
                "🎴 Random Tips",
                "- The default setup works great out of the box, just play normally and watch your world build itself",
                "- Enable AI Dungeon's built-in memory system for the best results",
                "- Gameplay -> AI Models -> Memory System -> Memory Bank -> Toggle-ON to enable",
                "- \"t\" and \"f\" are valid shorthand for \"true\" and \"false\" inside the config card",
                "- If Auto-Cards goes overboard with new cards, you can pause it by setting the cooldown config to 9999",
                "- Write \"{title:}\" anywhere within a regular story card's entry to transform it into an automatic card",
                "- Feel free to import/export entire story card decks at any time",
                "- Please copy my source code from here: https://play.aidungeon.com/profile/LewdLeah",
                "",
                Words.delimiter,
                "",
                "Happy adventuring! ❤️",
                "Please erase before continuing! <<<"
            )
        };
        for (const wordList in wordListInitializers) {
            // Define a lazy getter for every word list
            Object.defineProperty(Words, wordList, {
                configurable: false,
                enumerable: true,
                get() {
                    // If not already in cache, initialize and store the word list
                    if (!(wordList in Words.#cache)) {
                        Words.#cache[wordList] = O.f(wordListInitializers[wordList]());
                    }
                    return Words.#cache[wordList];
                }
            });
        }
    } }); }
    function hoistStringsHashed() { return (class StringsHashed {
        // Used for information-dense past memory recognition
        // Strings are converted to (reasonably) unique hashcodes for efficient existence checking
        static #defaultSize = 65536;
        #size;
        #store;
        constructor(size = StringsHashed.#defaultSize) {
            this.#size = size;
            this.#store = new Set();
            return this;
        }
        static deserialize(serialized, size = StringsHashed.#defaultSize) {
            const stringsHashed = new StringsHashed(size);
            stringsHashed.#store = new Set(serialized.split(","));
            return stringsHashed;
        }
        serialize() {
            return Array.from(this.#store).join(",");
        }
        has(str) {
            return this.#store.has(this.#hash(str));
        }
        add(str) {
            this.#store.add(this.#hash(str));
            return this;
        }
        remove(str) {
            this.#store.delete(this.#hash(str));
            return this;
        }
        size() {
            return this.#store.size;
        }
        latest(keepLatestCardinality) {
            if (this.#store.size <= keepLatestCardinality) {
                return this;
            }
            const excess = this.#store.size - keepLatestCardinality;
            const iterator = this.#store.values();
            for (let i = 0; i < excess; i++) {
                // The oldest hashcodes are removed first (insertion order matters!)
                this.#store.delete(iterator.next().value);
            }
            return this;
        }
        #hash(str) {
            let hash = 0;
            for (let i = 0; i < str.length; i++) {
                hash = ((31 * hash) + str.charCodeAt(i)) % this.#size;
            }
            return hash.toString(36);
        }
    }); }
    function hoistInternal() { return (class Internal {
        // Some exported API functions are internally reused by AutoCards
        // Recursively calling AutoCards().API is computationally wasteful
        // AutoCards uses this collection of static methods as an internal proxy
        static generateCard(request, predefinedPair = ["", ""]) {
            // Method call guide:
            // Internal.generateCard({
            //     // All properties except 'title' are optional
            //     type: "card type, defaults to 'class' for ease of filtering",
            //     title: "card title",
            //     keysStart: "preexisting card triggers",
            //     entryStart: "preexisting card entry",
            //     entryPrompt: "prompt the AI will use to complete this entry",
            //     entryPromptDetails: "extra details to include with this card's prompt",
            //     entryLimit: 750, // target character count for the generated entry
            //     description: "card notes",
            //     memoryStart: "preexisting card memory",
            //     memoryUpdates: true, // card updates when new relevant memories are formed
            //     memoryLimit: 2750, // max characters before the card memory is compressed
            // });
            const titleKeyPair = formatTitle((request.title ?? "").toString());
            const title = predefinedPair[0] || titleKeyPair.newTitle;
            if (
                (title === "")
                || (("title" in AC.generation.workpiece) && (title === AC.generation.workpiece.title))
                || (isAwaitingGeneration() && (AC.generation.pending.some(pendingWorkpiece => (
                    ("title" in pendingWorkpiece) && (title === pendingWorkpiece.title)
                ))))
            ) {
                logEvent("The title '" + request.title + "' is invalid or unavailable for card generation", true);
                return false;
            }
            AC.generation.pending.push(O.s({
                title: title,
                type: limitString((request.type || AC.config.defaultCardType).toString().trim(), 100),
                keys: predefinedPair[1] || buildKeys((request.keysStart ?? "").toString(), titleKeyPair.newKey),
                entry: limitString("{title: " + title + "}" + cleanSpaces((function() {
                    const entry = (request.entryStart ?? "").toString().trim();
                    if (entry === "") {
                        return "";
                    } else {
                        return ("\n" + entry + (function() {
                            if (/[a-zA-Z]$/.test(entry)) {
                                return ".";
                            } else {
                                return "";
                            }
                        })() + " ");
                    }
                })()), 2000),
                description: limitString((
                    (function() {
                        const description = limitString((request.description ?? "").toString().trim(), 9900);
                        if (description === "") {
                            return "";
                        } else {
                            return description + "\n\n";
                        }
                    })() + "Auto-Cards will contextualize these memories:\n{updates: " + (function() {
                        if (typeof request.memoryUpdates === "boolean") {
                            return request.memoryUpdates;
                        } else {
                            return AC.config.defaultCardsDoMemoryUpdates;
                        }
                    })() + ", limit: " + validateMemoryLimit(
                        parseInt((request.memoryLimit || AC.config.defaultMemoryLimit), 10)
                    ) + "}" + (function() {
                        const cardMemoryBank = cleanSpaces((request.memoryStart ?? "").toString().trim());
                        if (cardMemoryBank === "") {
                            return "";
                        } else {
                            return "\n" + cardMemoryBank.split("\n").map(memory => addBullet(memory)).join("\n");
                        }
                    })()
                ), 10000),
                prompt: (function() {
                    let prompt = insertTitle((
                        (request.entryPrompt ?? "").toString().trim() || AC.config.generationPrompt.trim()
                    ), title);
                    let promptDetails = insertTitle((
                        cleanSpaces((request.entryPromptDetails ?? "").toString().trim())
                    ), title);
                    if (promptDetails !== "") {
                        const spacesPrecedingTerminalEntryPlaceholder = (function() {
                            const terminalEntryPlaceholderPattern = /(?:[%\$]+\s*|[%\$]*){+\s*entry\s*}+$/i;
                            if (terminalEntryPlaceholderPattern.test(prompt)) {
                                prompt = prompt.replace(terminalEntryPlaceholderPattern, "");
                                const trailingSpaces = prompt.match(/(\s+)$/);
                                if (trailingSpaces) {
                                    prompt = prompt.trimEnd();
                                    return trailingSpaces[1];
                                } else {
                                    return "\n\n";
                                }
                            } else {
                                return "";
                            }
                        })();
                        switch(prompt[prompt.length - 1]) {
                        case "]": { encapsulateBothPrompts("[", true, "]"); break; }
                        case ">": { encapsulateBothPrompts(null, false, ">"); break; }
                        case "}": { encapsulateBothPrompts("{", true, "}"); break; }
                        case ")": { encapsulateBothPrompts("(", true, ")"); break; }
                        case "/": { encapsulateBothPrompts("/", true, "/"); break; }
                        case "#": { encapsulateBothPrompts("#", true, "#"); break; }
                        case "-": { encapsulateBothPrompts(null, false, "-"); break; }
                        case ":": { encapsulateBothPrompts(":", true, ":"); break; }
                        case "<": { encapsulateBothPrompts(">", true, "<"); break; }
                        };
                        if (promptDetails.includes("\n")) {
                            const lines = promptDetails.split("\n");
                            for (let i = 0; i < lines.length; i++) {
                                lines[i] = addBullet(lines[i].trim());
                            }
                            promptDetails = lines.join("\n");
                        } else {
                            promptDetails = addBullet(promptDetails);
                        }
                        prompt += "\n" + promptDetails + (function() {
                            if (spacesPrecedingTerminalEntryPlaceholder !== "") {
                                // Prompt previously contained a terminal %{entry} placeholder, re-append it
                                return spacesPrecedingTerminalEntryPlaceholder + "%{entry}";
                            }
                            return "";
                        })();
                        function encapsulateBothPrompts(leftSymbol, slicesAtMiddle, rightSymbol) {
                            if (slicesAtMiddle) {
                                prompt = prompt.slice(0, -1).trim();
                                if (promptDetails.startsWith(leftSymbol)) {
                                    promptDetails = promptDetails.slice(1).trim();
                                }
                            }
                            if (!promptDetails.endsWith(rightSymbol)) {
                                promptDetails += rightSymbol;
                            }
                            return;
                        }
                    }
                    return limitString(prompt, Math.floor(0.8 * AC.signal.maxChars));
                })(),
                limit: validateEntryLimit(parseInt((request.entryLimit || AC.config.defaultEntryLimit), 10))
            }));
            notify("Generating card for \"" + title + "\"");
            function addBullet(str) {
                return "- " + str.replace(/^-+\s*/, "");
            }
            return true;
        }
        static redoCard(request, useOldInfo, newInfo) {
            const card = getIntendedCard(request.title)[0];
            const oldCard = O.f({...card});
            if (!eraseCard(card)) {
                return false;
            } else if (newInfo !== "") {
                request.entryPromptDetails = (request.entryPromptDetails ?? "").toString() + "\n" + newInfo;
            }
            O.f(request);
            Internal.getUsedTitles(true);
            if (!Internal.generateCard(request) && !Internal.generateCard(request, [
                (oldCard.entry.match(/^{title: ([\s\S]*?)}/)?.[1] || request.title.replace(/\w\S*/g, word => (
                    word[0].toUpperCase() + word.slice(1).toLowerCase()
                ))), oldCard.keys
            ])) {
                constructCard(oldCard, newCardIndex());
                Internal.getUsedTitles(true);
                return false;
            } else if (!useOldInfo) {
                return true;
            }
            AC.generation.pending[AC.generation.pending.length - 1].prompt = ((
                removeAutoProps(oldCard.entry) + "\n\n" +
                removeAutoProps(isolateNotesAndMemories(oldCard.description)[1])
            ).trimEnd() + "\n\n" + AC.generation.pending[AC.generation.pending.length - 1].prompt).trim();
            return true;
        }
        static eraseAllAutoCards() {
            const cards = [];
            Internal.getUsedTitles(true);
            for (const card of storyCards) {
                if (card.entry.startsWith("{title: ")) {
                    cards.push(card);
                }
            }
            for (const card of cards) {
                eraseCard(card);
            }
            auto.clear();
            forgetStuff();
            clearTransientTitles();
            AC.generation.pending = [];
            AC.database.memories.associations = {};
            if (AC.config.deleteAllAutoCards) {
                AC.config.deleteAllAutoCards = null;
            }
            return cards.length;
        }
        static getUsedTitles(isExternal = false) {
            if (isExternal) {
                bans.clear();
                isBanned("", true);
            } else if (0 < AC.database.titles.used.length) {
                return AC.database.titles.used;
            }
            // All unique used titles and keys encountered during this iteration
            const seen = new Set();
            auto.clear();
            clearTransientTitles();
            AC.database.titles.used = ["%@%"];
            for (const card of storyCards) {
                // Perform some common-sense maintenance while we're here
                card.type = card.type.trim();
                card.title = card.title.trim();
                // card.keys should be left as-is
                card.entry = card.entry.trim();
                card.description = card.description.trim();
                if (isExternal) {
                    O.s(card);
                } else if (!shouldProceed()) {
                    checkRemaining();
                    continue;
                }
                // An ideal auto-card's entry starts with "{title: Example of Greatness}" (example)
                // An ideal auto-card's description contains "{updates: true, limit: 2750}" (example)
                if (checkPlurals(denumberName(card.title.replace("\n", "")), t => isBanned(t))) {
                    checkRemaining();
                    continue;
                } else if (!card.keys.includes(",")) {
                    const cleanKeys = denumberName(card.keys.trim());
                    if ((2 < cleanKeys.length) && checkPlurals(cleanKeys, t => isBanned(t))) {
                        checkRemaining();
                        continue;
                    }
                }
                // Detect and repair malformed auto-card properties in a fault-tolerant manner
                const traits = [card.entry, card.description].map((str, i) => {
                    // Absolute abomination uwu
                    const hasUpdates = /updates?\s*:[\s\S]*?(?:(?:title|limit)s?\s*:|})/i.test(str);
                    const hasLimit = /limits?\s*:[\s\S]*?(?:(?:title|update)s?\s*:|})/i.test(str);
                    return [(function() {
                        if (hasUpdates || hasLimit) {
                            if (/titles?\s*:[\s\S]*?(?:(?:limit|update)s?\s*:|})/i.test(str)) {
                                return 2;
                            }
                            return false;
                        } else if (/titles?\s*:[\s\S]*?}/i.test(str)) {
                            return 1;
                        } else if (!(
                            (i === 0)
                            && /{[\s\S]*?}/.test(str)
                            && (str.match(/{/g)?.length === 1)
                            && (str.match(/}/g)?.length === 1)
                        )) {
                            return false;
                        }
                        const badTitleHeaderMatch = str.match(/{([\s\S]*?)}/);
                        if (!badTitleHeaderMatch) {
                            return false;
                        }
                        const inferredTitle = badTitleHeaderMatch[1].split(",")[0].trim();
                        if (
                            (2 < inferredTitle.length)
                            && (inferredTitle.length <= 100)
                            && (badTitleHeaderMatch[0].length < str.length)
                        ) {
                            // A rare case where the title's existence should be inferred from the enclosing {curly brackets}
                            return inferredTitle;
                        }
                        return false;
                    })(), hasUpdates, hasLimit];
                }).flat();
                if (traits.every(trait => !trait)) {
                    // This card contains no auto-card traits, not even malformed ones
                    checkRemaining();
                    continue;
                }
                const [
                    hasEntryTitle,
                    hasEntryUpdates,
                    hasEntryLimit,
                    hasDescTitle,
                    hasDescUpdates,
                    hasDescLimit
                ] = traits;
                // Handle all story cards which belong to the Auto-Cards ecosystem
                // May flag this damaged auto-card for later repairs
                // May flag this duplicate auto-card for deformatting (will become a regular story card)
                let repair = false;
                let release = false;
                const title = (function() {
                    let title = "";
                    if (typeof hasEntryTitle === "string") {
                        repair = true;
                        title = formatTitle(hasEntryTitle).newTitle;
                        if (hasDescTitle && bad()) {
                            title = parseTitle(false);
                        }
                    } else if (hasEntryTitle) {
                        title = parseTitle(true);
                        if (hasDescTitle) {
                            repair = true;
                            if (bad()) {
                                title = parseTitle(false);
                            }
                        } else if (1 < card.entry.match(/titles?\s*:/gi)?.length) {
                            repair = true;
                        }
                    } else if (hasDescTitle) {
                        repair = true;
                        title = parseTitle(false);
                    }
                    if (bad()) {
                        repair = true;
                        title = formatTitle(card.title).newTitle;
                        if (bad()) {
                            release = true;
                        } else {
                            seen.add(title);
                            auto.add(title.toLowerCase());
                        }
                    } else {
                        seen.add(title);
                        auto.add(title.toLowerCase());
                        const titleHeader = "{title: " + title + "}";
                        if (!repair && !((card.entry === titleHeader) || card.entry.startsWith(titleHeader + "\n"))) {
                            repair = true;
                        }
                    }
                    function bad() {
                        return ((title === "") || checkPlurals(title, t => auto.has(t)));
                    }
                    function parseTitle(fromEntry) {
                        const [sourceType, sourceText] = (function() {
                            if (fromEntry) {
                                return [hasEntryTitle, card.entry];
                            } else {
                                return [hasDescTitle, card.description];
                            }
                        })()
                        switch(sourceType) {
                        case 1: {
                            return formatTitle(isolateProperty(
                                sourceText,
                                /titles?\s*:[\s\S]*?}/i,
                                /(?:titles?\s*:|})/gi
                            )).newTitle; }
                        case 2: {
                            return formatTitle(isolateProperty(
                                sourceText,
                                /titles?\s*:[\s\S]*?(?:(?:limit|update)s?\s*:|})/i,
                                /(?:(?:title|update|limit)s?\s*:|})/gi
                            )).newTitle; }
                        default: {
                            return ""; }
                        }
                    }
                    return title;
                })();
                if (release) {
                    // Remove Auto-Cards properties from this incompatible story card
                    safeRemoveProps();
                    card.description = (card.description
                        .replace(/\s*Auto(?:-|\s*)Cards\s*will\s*contextualize\s*these\s*memories\s*:\s*/gi, "")
                        .replaceAll("%@%", "\n\n")
                        .trim()
                    );
                    seen.delete(title);
                    checkRemaining();
                    continue;
                }
                const memoryProperties = "{updates: " + (function() {
                    let updates = null;
                    if (hasDescUpdates) {
                        updates = parseUpdates(false);
                        if (hasEntryUpdates) {
                            repair = true;
                            if (bad()) {
                                updates = parseUpdates(true);
                            }
                        } else if (1 < card.description.match(/updates?\s*:/gi)?.length) {
                            repair = true;
                        }
                    } else if (hasEntryUpdates) {
                        repair = true;
                        updates = parseUpdates(true);
                    }
                    if (bad()) {
                        repair = true;
                        updates = AC.config.defaultCardsDoMemoryUpdates;
                    }
                    function bad() {
                        return (updates === null);
                    }
                    function parseUpdates(fromEntry) {
                        const updatesText = (isolateProperty(
                            (function() {
                                if (fromEntry) {
                                    return card.entry;
                                } else {
                                    return card.description;
                                }
                            })(),
                            /updates?\s*:[\s\S]*?(?:(?:title|limit)s?\s*:|})/i,
                            /(?:(?:title|update|limit)s?\s*:|})/gi
                        ).toLowerCase().replace(/[^a-z]/g, ""));
                        if (Words.trues.includes(updatesText)) {
                            return true;
                        } else if (Words.falses.includes(updatesText)) {
                            return false;
                        } else {
                            return null;
                        }
                    }
                    return updates;
                })() + ", limit: " + (function() {
                    let limit = -1;
                    if (hasDescLimit) {
                        limit = parseLimit(false);
                        if (hasEntryLimit) {
                            repair = true;
                            if (bad()) {
                                limit = parseLimit(true);
                            }
                        } else if (1 < card.description.match(/limits?\s*:/gi)?.length) {
                            repair = true;
                        }
                    } else if (hasEntryLimit) {
                        repair = true;
                        limit = parseLimit(true);
                    }
                    if (bad()) {
                        repair = true;
                        limit = AC.config.defaultMemoryLimit;
                    } else {
                        limit = validateMemoryLimit(limit);
                    }
                    function bad() {
                        return (limit === -1);
                    }
                    function parseLimit(fromEntry) {
                        const limitText = (isolateProperty(
                            (function() {
                                if (fromEntry) {
                                    return card.entry;
                                } else {
                                    return card.description;
                                }
                            })(),
                            /limits?\s*:[\s\S]*?(?:(?:title|update)s?\s*:|})/i,
                            /(?:(?:title|update|limit)s?\s*:|})/gi
                        ).replace(/[^0-9]/g, ""));
                        if ((limitText === "")) {
                            return -1;
                        } else {
                            return parseInt(limitText, 10);
                        }
                    }
                    return limit.toString();
                })() + "}";
                if (!repair && (new RegExp("(?:^|\\n)" + memoryProperties + "(?:\\n|$)")).test(card.description)) {
                    // There are no serious repairs to perform
                    card.entry = cleanSpaces(card.entry);
                    const [notes, memories] = isolateNotesAndMemories(card.description);
                    const pureMemories = cleanSpaces(memories.replace(memoryProperties, "").trim());
                    rejoinDescription(notes, memoryProperties, pureMemories);
                    checkRemaining();
                    continue;
                }
                // Damage was detected, perform an adaptive repair on this auto-card's configurable properties
                card.description = card.description.replaceAll("%@%", "\n\n");
                safeRemoveProps();
                card.entry = limitString(("{title: " + title + "}\n" + card.entry).trimEnd(), 2000);
                const [left, right] = card.description.split("%@%");
                rejoinDescription(left, memoryProperties, right);
                checkRemaining();
                function safeRemoveProps() {
                    if (typeof hasEntryTitle === "string") {
                        card.entry = card.entry.replace(/{[\s\S]*?}/g, "");
                    }
                    card.entry = removeAutoProps(card.entry);
                    const [notes, memories] = isolateNotesAndMemories(card.description);
                    card.description = notes + "%@%" + removeAutoProps(memories);
                    return;
                }
                function rejoinDescription(notes, memoryProperties, memories) {
                    card.description = limitString((notes + (function() {
                        if (notes === "") {
                            return "";
                        } else if (notes.endsWith("Auto-Cards will contextualize these memories:")) {
                            return "\n";
                        } else {
                            return "\n\n";
                        }
                    })() + memoryProperties + (function() {
                        if (memories === "") {
                            return "";
                        } else {
                            return "\n";
                        }
                    })() + memories), 10000);
                    return;
                }
                function isolateProperty(sourceText, propMatcher, propCleaner) {
                    return ((sourceText.match(propMatcher)?.[0] || "")
                        .replace(propCleaner, "")
                        .split(",")[0]
                        .trim()
                    );
                }
                // Observe literal card titles and keys
                function checkRemaining() {
                    const literalTitles = [card.title, ...card.keys.split(",")];
                    for (let i = 0; i < literalTitles.length; i++) {
                        // The pre-format set inclusion check helps avoid superfluous formatTitle calls
                        literalTitles[i] = (literalTitles[i]
                            .replace(/["\.\?!;\(\):\[\]—{}]/g, " ")
                            .trim()
                            .replace(/\s+/g, " ")
                            .replace(/^'\s*/, "")
                            .replace(/\s*'$/, "")
                        );
                        if (seen.has(literalTitles[i])) {
                            continue;
                        }
                        literalTitles[i] = formatTitle(literalTitles[i]).newTitle;
                        if (literalTitles[i] !== "") {
                            seen.add(literalTitles[i]);
                        }
                    }
                    return;
                }
                function denumberName(name) {
                    if (2 < (name.match(/[^\d\s]/g) || []).length) {
                        // Important for identifying LSIv2 auxiliary code cards when banned
                        return name.replace(/\s*\d+$/, "");
                    } else {
                        return name;
                    }
                }
            }
            clearTransientTitles();
            AC.database.titles.used = [...seen];
            return AC.database.titles.used;
        }
        static getBannedTitles() {
            // AC.database.titles.banned is an array, not a set; order matters
            return AC.database.titles.banned;
        }
        static setBannedTitles(newBans, isFinalAssignment) {
            AC.database.titles.banned = [];
            AC.database.titles.pendingBans = [];
            AC.database.titles.pendingUnbans = [];
            for (let i = newBans.length - 1; 0 <= i; i--) {
                banTitle(newBans[i], isFinalAssignment);
            }
            return AC.database.titles.banned;
        }
        static getCard(predicate, getAll) {
            if (getAll) {
                // Return an array of card references which satisfy the given condition
                const collectedCards = [];
                for (const card of storyCards) {
                    if (predicate(card)) {
                        O.s(card);
                        collectedCards.push(card);
                    }
                }
                return collectedCards;
            }
            // Return a reference to the first card which satisfies the given condition
            for (const card of storyCards) {
                if (predicate(card)) {
                    return O.s(card);
                }
            }
            return null;
        }
        static generateItemCard(itemName) {
            const itemPrompt = prose(
                "-----",
                "",
                "<SYSTEM>",
                "# Stop the story and ignore previous instructions. Write a brief and coherent informational entry for an item named %{title} following these instructions:",
                "- Write only third-person pure prose information about %{title} using complete sentences with correct punctuation",
                "- Include details about the item's appearance, weight, value, and any potential effects.",
                "- Create new information based on the context and story direction",
                "- Mention %{title} in every sentence",
                "- Be concise and grounded",
                "- Imitate the story's writing style and infer the reader's preferences",
                "</SYSTEM>",
                "Continue the entry for %{title} below while avoiding repetition:",
                "%{entry}"
            );

            AC.generation.pending.push(O.s({
                generationType: 'item_description',
                title: itemName,
                prompt: itemPrompt,
                type: 'item',
                keys: itemName,
                entry: `{title: ${itemName}}`,
                description: `{updates: true, limit: ${AC.config.defaultMemoryLimit}}`,
                limit: AC.config.defaultEntryLimit
            }));
            notify("Generating card for \"" + itemName + "\"");
            return true;
        }
        static updateInventory(action, itemName, quantity = 1, containerName = null) {
            let inventoryCard = Internal.getCard(card => card.title === "Inventory");
            if (!inventoryCard) {
                return;
            }

            let targetContainer = AC.database.inventory.items;
            if (containerName) {
                if (AC.database.inventory.items[containerName]) {
                    if (!AC.database.inventory.items[containerName].items) {
                        AC.database.inventory.items[containerName].items = {};
                    }
                    targetContainer = AC.database.inventory.items[containerName].items;
                }
            }

            const item = targetContainer[itemName];

            if (action === "add") {
                if (item) {
                    item.quantity += quantity;
                } else {
                    targetContainer[itemName] = { quantity: quantity };
                }
            } else if (action === "remove") {
                if (item) {
                    item.quantity -= quantity;
                    if (item.quantity <= 0) {
                        delete targetContainer[itemName];
                    }
                }
            }
            inventoryCard.entry = Internal.renderInventory();
        }
        static renderInventory() {
            let inventoryText = "You are carrying:";
            const renderItems = (items, indent = "") => {
                for (const itemName in items) {
                    const item = items[itemName];
                    inventoryText += `\n${indent}- ${itemName} (${item.quantity})`;
                    if (item.items) {
                        renderItems(item.items, indent + "  ");
                    }
                }
            };
            renderItems(AC.database.inventory.items);
            return inventoryText;
        }
        static parseAndPopulateInventory(text) {
            const lines = text.split('\n');
            let currentContainer = null;

            for (const line of lines) {
                const itemMatch = line.match(/^\s*-\s*([\w\s]+)\s*\((\d+)\)/);
                if (itemMatch) {
                    const itemName = itemMatch[1].trim();
                    const quantity = parseInt(itemMatch[2], 10);
                    const indent = (line.match(/^\s*/) || [""])[0].length;

                    if (indent === 0) {
                        AC.database.inventory.items[itemName] = { quantity: quantity };
                        currentContainer = itemName;
                    } else if (currentContainer && AC.database.inventory.items[currentContainer]) {
                        if (!AC.database.inventory.items[currentContainer].items) {
                            AC.database.inventory.items[currentContainer].items = {};
                        }
                        AC.database.inventory.items[currentContainer].items[itemName] = { quantity: quantity };
                    }
                }
            }
        }
        static generateStartingInventory() {
            return prose(
                "-----",
                "",
                "<SYSTEM>",
                "# Stop the story and ignore previous instructions. Describe the items the player is carrying at the start of the adventure.",
                "- List the items in a bulleted format, using the exact format: - Item Name (quantity)",
                "- Be creative and generate a few starting items based on the story's context.",
                "</SYSTEM>",
                "You are carrying:"
            );
        }
    }); }
    function validateCooldown(cooldown) {
        return boundInteger(0, cooldown, 9999, 22);
    }
    function validateEntryLimit(entryLimit) {
        return boundInteger(200, entryLimit, 2000, 750);
    }
    function validateMemoryLimit(memoryLimit) {
        return boundInteger(1750, memoryLimit, 9900, 2750);
    }
    function validateMemCompRatio(memCompressRatio) {
        return boundInteger(20, memCompressRatio, 1250, 25);
    }
    function validateMinLookBackDist(minLookBackDist) {
        return boundInteger(2, minLookBackDist, 88, 7);
    }
    function uniqueTitlesArray(titles) {
        const existingTitles = new Set();
        return (titles
            .map(title => title.trim().replace(/\s+/g, " "))
            .filter(title => {
                if (title === "") {
                    return false;
                }
                const lowerTitle = title.toLowerCase();
                if (existingTitles.has(lowerTitle)) {
                    return false;
                } else {
                    existingTitles.add(lowerTitle);
                    return true;
                }
            })
        );
    }
    function boundInteger(lowerBound, value, upperBound, fallback) {
        if (!Number.isInteger(value)) {
            if (!Number.isInteger(fallback)) {
                throw new Error("Invalid arguments: value and fallback are not integers");
            }
            value = fallback;
        }
        if (Number.isInteger(lowerBound) && (value < lowerBound)) {
            if (Number.isInteger(upperBound) && (upperBound < lowerBound)) {
                throw new Error("Invalid arguments: The inequality (lowerBound <= upperBound) must be satisfied");
            }
            return lowerBound;
        } else if (Number.isInteger(upperBound) && (upperBound < value)) {
            return upperBound;
        } else {
            return value;
        }
    }
    function limitString(str, lengthLimit) {
        if (lengthLimit < str.length) {
            return str.slice(0, lengthLimit).trim();
        } else {
            return str;
        }
    }
    function cleanSpaces(unclean) {
        return (unclean
            .replace(/\s*\n\s*/g, "\n")
            .replace(/\t/g, " ")
            .replace(/  +/g, " ")
        );
    }
    function isolateNotesAndMemories(str) {
        const bisector = str.search(/\s*(?:{|(?:title|update|limit)s?\s*:)\s*/i);
        if (bisector === -1) {
            return [str, ""];
        } else {
            return [str.slice(0, bisector), str.slice(bisector)];
        }
    }
    function removeAutoProps(str) {
        return cleanSpaces(str
            .replace(/\s*{([\s\S]*?)}\s*/g, (bracedMatch, enclosedProperties) => {
                if (enclosedProperties.trim().length < 150) {
                    return "\n";
                } else {
                    return bracedMatch;
                }
            })
            .replace((
                /\s*(?:{|(?:title|update|limit)s?\s*:)(?:[\s\S]{0,150}?)(?=(?:title|update|limit)s?\s*:|})\s*/gi
            ), "\n")
            .replace(/\s*(?:{|(?:title|update|limit)s?\s*:|})\s*/gi, "\n")
            .trim()
        );
    }
    function insertTitle(prompt, title) {
        return prompt.replace((
            /(?:[%\$]+\s*|[%\$]*){+\s*(?:titles?|names?|characters?|class(?:es)?|races?|locations?|factions?)\s*}+/gi
        ), title);
    }
    function prose(...args) {
        return args.join("\n");
    }
    function buildKeys(keys, key) {
        key = key.trim().replace(/\s+/g, " ");
        const keyset = [];
        if (key === "") {
            return keys;
        } else if (keys.trim() !== "") {
            keyset.push(...keys.split(","));
            const lowerKey = key.toLowerCase();
            for (let i = keyset.length - 1; 0 <= i; i--) {
                const preKey = keyset[i].trim().replace(/\s+/g, " ").toLowerCase();
                if ((preKey === "") || preKey.includes(lowerKey)) {
                    keyset.splice(i, 1);
                }
            }
        }
        if (key.length < 6) {
            keyset.push(...[
                " " + key + " ", " " + key + "'", "\"" + key + " ", " " + key + ".", " " + key + "?", " " + key + "!", " " + key + ";", "'" + key + " ", "(" + key + " ", " " + key + ")", " " + key + ":", " " + key + "\"", "[" + key + " ", " " + key + "]", "—" + key + " ", " " + key + "—", "{" + key + " ", " " + key + "}"
            ]);
        } else if (key.length < 9) {
            keyset.push(...[
                key + " ", " " + key, key + "'", "\"" + key, key + ".", key + "?", key + "!", key + ";", "'" + key, "(" + key, key + ")", key + ":", key + "\"", "[" + key, key + "]", "—" + key, key + "—", "{" + key, key + "}"
            ]);
        } else {
            keyset.push(key);
        }
        keys = keyset[0] || key;
        let i = 1;
        while ((i < keyset.length) && ((keys.length + 1 + keyset[i].length) < 101)) {
            keys += "," + keyset[i];
            i++;
        }
        return keys;
    }
    // Returns the template-specified singleton card (or secondary varient) after:
    // 1) Erasing all inferior duplicates
    // 2) Repairing damaged titles and keys
    // 3) Constructing a new singleton card if it doesn't exist
    function getSingletonCard(allowConstruction, templateCard, secondaryCard) {
        let singletonCard = null;
        const excessCards = [];
        for (const card of storyCards) {
            O.s(card);
            if (singletonCard === null) {
                if ((card.title === templateCard.title) || (card.keys === templateCard.keys)) {
                    // The first potentially valid singleton card candidate to be found
                    singletonCard = card;
                }
            } else if (card.title === templateCard.title) {
                if (card.keys === templateCard.keys) {
                    excessCards.push(singletonCard);
                    singletonCard = card;
                } else {
                    eraseInferiorDuplicate();
                }
            } else if (card.keys === templateCard.keys) {
                eraseInferiorDuplicate();
            }
            function eraseInferiorDuplicate() {
                if ((singletonCard.title === templateCard.title) && (singletonCard.keys === templateCard.keys)) {
                    excessCards.push(card);
                } else {
                    excessCards.push(singletonCard);
                    singletonCard = card;
                }
                return;
            }
        }
        if (singletonCard === null) {
            if (secondaryCard) {
                // Fallback to a secondary card template
                singletonCard = getSingletonCard(false, secondaryCard);
            }
            // No singleton card candidate exists
            if (allowConstruction && (singletonCard === null)) {
                // Construct a new singleton card from the given template
                singletonCard = constructCard(templateCard);
            }
        } else {
            if (singletonCard.title !== templateCard.title) {
                // Repair any damage to the singleton card's title
                singletonCard.title = templateCard.title;
            } else if (singletonCard.keys !== templateCard.keys) {
                // Repair any damage to the singleton card's keys
                singletonCard.keys = templateCard.keys;
            }
            for (const card of excessCards) {
                // Erase all excess singleton card candidates
                eraseCard(card);
            }
            if (secondaryCard) {
                // A secondary card match cannot be allowed to persist
                eraseCard(getSingletonCard(false, secondaryCard));
            }
        }
        return singletonCard;
    }
    // Erases the given story card
    function eraseCard(badCard) {
        if (badCard === null) {
            return false;
        }
        badCard.title = "%@%";
        for (const [index, card] of storyCards.entries()) {
            if (card.title === "%@%") {
                removeStoryCard(index);
                return true;
            }
        }
        return false;
    }
    // Constructs a new story card from a standardized story card template object
    // {type: "", title: "", keys: "", entry: "", description: ""}
    // Returns a reference to the newly constructed card
    function constructCard(templateCard, insertionIndex = 0) {
        addStoryCard("%@%");
        for (const [index, card] of storyCards.entries()) {
            if (card.title !== "%@%") {
                continue;
            }
            card.type = templateCard.type;
            card.title = templateCard.title;
            card.keys = templateCard.keys;
            card.entry = templateCard.entry;
            card.description = templateCard.description;
            if (index !== insertionIndex) {
                // Remove from the current position and reinsert at the desired index
                storyCards.splice(index, 1);
                storyCards.splice(insertionIndex, 0, card);
            }
            return O.s(card);
        }
        return {};
    }
    function newCardIndex() {
        return +AC.config.pinConfigureCard;
    }
    function getIntendedCard(targetCard) {
        Internal.getUsedTitles(true);
        const titleKey = targetCard.trim().replace(/\s+/g, " ").toLowerCase();
        const autoCard = Internal.getCard(card => (card.entry
            .toLowerCase()
            .startsWith("{title: " + titleKey + "}")
        ));
        if (autoCard !== null) {
            return [autoCard, true, titleKey];
        }
        return [Internal.getCard(card => ((card.title
            .replace(/\s+/g, " ")
            .toLowerCase()
        ) === titleKey)), false, titleKey];
    }
    function advanceChronometer() {
        const currentTurn = getTurn();
        if (Math.abs(history.length - currentTurn) < 2) {
            // The two measures are within ±1, thus history hasn't been truncated yet
            AC.chronometer.step = !(history.length < currentTurn);
        } else {
            // history has been truncated, fallback to a (slightly) worse step detection technique
            AC.chronometer.step = (AC.chronometer.turn < currentTurn);
        }
        AC.chronometer.turn = currentTurn;
        return;
    }
    function concludeEmergency() {
        promoteAmnesia();
        endTurn();
        AC.message.pending = [];
        AC.message.previous = getStateMessage();
        return;
    }
    function concludeOutputBlock(templateCard) {
        if (AC.config.deleteAllAutoCards !== null) {
            // A config-initiated event to delete all previously generated story cards is in progress
            if (AC.config.deleteAllAutoCards) {
                // Request in-game confirmation from the player before proceeding
                AC.config.deleteAllAutoCards = false;
                CODOMAIN.initialize(getPrecedingNewlines() + ">>> please submit the message \"CONFIRM DELETE\" using a Do, Say, or Story action to permanently delete all previously generated story cards <<<\n\n");
            } else {
                // Check for player confirmation
                const previousAction = readPastAction(0);
                if (isDoSayStory(previousAction.type) && /CONFIRM\s*DELETE/i.test(previousAction.text)) {
                    let successMessage = "Confirmation Success: ";
                    const numCardsErased = Internal.eraseAllAutoCards();
                    if (numCardsErased === 0) {
                        successMessage += "However, there were no previously generated story cards to delete!";
                    } else {
                        successMessage += numCardsErased + " generated story card";
                        if (numCardsErased === 1) {
                            successMessage += " was";
                        } else {
                            successMessage += "s were";
                        }
                        successMessage += " deleted";
                    }
                    notify(successMessage);
                } else {
                    notify("Confirmation Failure: No story cards were deleted");
                }
                AC.config.deleteAllAutoCards = null;
                CODOMAIN.initialize("\n");
            }
        } else if (AC.signal.outputReplacement !== "") {
            const output = AC.signal.outputReplacement.trim();
            if (output === "") {
                CODOMAIN.initialize("\n");
            } else {
                CODOMAIN.initialize(getPrecedingNewlines() + output + "\n\n");
            }
        }
        if (templateCard) {
            // Auto-Cards was enabled or disabled during the previous onContext hook
            // Construct the replacement control card onOutput
            banTitle(templateCard.title);
            getSingletonCard(true, templateCard);
            AC.signal.swapControlCards = false;
        }
        endTurn();
        postMessages();
        return;
    }
    function endTurn() {
        AC.database.titles.used = [];
        AC.signal.outputReplacement = "";
        [AC.database.titles.pendingBans, AC.database.titles.pendingUnbans].map(pending => decrementAll(pending));
        if (0 < AC.signal.overrideBans) {
            AC.signal.overrideBans--;
        }
        function decrementAll(pendingArray) {
            if (pendingArray.length === 0) {
                return;
            }
            for (let i = pendingArray.length - 1; 0 <= i; i--) {
                if (0 < pendingArray[i][1]) {
                    pendingArray[i][1]--;
                } else {
                    pendingArray.splice(i, 1);
                }
            }
            return;
        }
        return;
    }
    // Example usage: notify("Message text goes here");
    function notify(message) {
        if (typeof message === "string") {
            AC.message.pending.push(message);
            logEvent(message);
        } else if (Array.isArray(message)) {
            message.forEach(element => notify(element));
        } else if (message instanceof Set) {
            notify([...message]);
        } else {
            notify(message.toString());
        }
        return;
    }
    function logEvent(message, uncounted) {
        if (uncounted) {
            log("Auto-Cards event: " + message);
        } else {
            log("Auto-Cards event #" + (function() {
                try {
                    AC.message.event++;
                    return AC.message.event;
                } catch {
                    return 0;
                }
            })() + ": " + message.replace(/"/g, "'"));
        }
        return;
    }
    // Provide the story card object which you wish to log info within as the first argument
    // All remaining arguments represent anything you wish to log
    function logToCard(logCard, ...args) {
        logEvent(args.map(arg => {
            if ((typeof arg === "object") && (arg !== null)) {
                return JSON.stringify(arg);
            } else {
                return String(arg);
            }
        }).join(", "), true);
        if (logCard === null) {
            return;
        }
        let desc = logCard.description.trim();
        const turnDelimiter = Words.delimiter + "\nAction #" + getTurn() + ":\n";
        let header = turnDelimiter;
        if (!desc.startsWith(turnDelimiter)) {
            desc = turnDelimiter + desc;
        }
        const scopesTable = [
            ["input", "Input Modifier"],
            ["context", "Context Modifier"],
            ["output", "Output Modifier"],
            [null, "Shared Library"],
            [undefined, "External API"],
            [Symbol("default"), "Unknown Scope"]
        ];
        const callingScope = (function() {
            const pair = scopesTable.find(([condition]) => (condition === HOOK));
            if (pair) {
                return pair[1];
            } else {
                return scopesTable[scopesTable.length - 1][1];
            }
        })();
        const hookDelimiterLeft = callingScope + " @ ";
        if (desc.startsWith(turnDelimiter + hookDelimiterLeft)) {
            const hookDelimiterOld = desc.match(new RegExp((
                "^" + turnDelimiter + "(" + hookDelimiterLeft + "\\d{4}-\\d{2}-\\d{2}T\\d{2}:\\d{2}:\\d{2}\\.\\d{3}Z:\n)"
            ).replaceAll("\n", "\\n")));
            if (hookDelimiterOld) {
                header += hookDelimiterOld[1];
            } else {
                const hookDelimiter = getNewHookDelimiter();
                desc = desc.replace(hookDelimiterLeft, hookDelimiter);
                header += hookDelimiter;
            }
        } else {
            if ((new RegExp("^" + turnDelimiter.replaceAll("\n", "\\n") + "(" + (scopesTable
                .map(pair => pair[1])
                .filter(scope => (scope !== callingScope))
                .join("|")
            ) + ") @ ")).test(desc)) {
                desc = desc.replace(turnDelimiter, turnDelimiter + "—————————\n");
            }
            const hookDelimiter = getNewHookDelimiter();
            desc = desc.replace(turnDelimiter, turnDelimiter + hookDelimiter);
            header += hookDelimiter;
        }
        const logDelimiter = (function() {
            let logDelimiter = "Log #";
            if (desc.startsWith(header + logDelimiter)) {
                desc = desc.replace(header, header + "———\n");
                const logCounter = desc.match(/Log #(\d+)/);
                if (logCounter) {
                    logDelimiter += (parseInt(logCounter[1], 10) + 1).toString();
                }
            } else {
                logDelimiter += "0";
            }
            return logDelimiter + ": ";
        })();
        logCard.description = limitString(desc.replace(header, header + logDelimiter + args.map(arg => {
            if ((typeof arg === "object") && (arg !== null)) {
                return stringifyObject(arg);
            } else {
                return String(arg);
            }
        }).join(",\n") + "\n").trim(), 999999);
        // The upper limit is actually closer to 3985621, but I think 1 million is reasonable enough as-is
        function getNewHookDelimiter() {
            return hookDelimiterLeft + (new Date().toISOString()) + ":\n";
        }
        return;
    }
    // Makes nested objects not look like cancer within interface cards
    function stringifyObject(obj) {
        const seen = new WeakSet();
        // Each indentation is 4 spaces
        return JSON.stringify(obj, (_key, value) => {
            if ((typeof value === "object") && (value !== null)) {
                if (seen.has(value)) {
                    return "[Circular]";
                }
                seen.add(value);
            }
            switch(typeof value) {
            case "function": {
                return "[Function]"; }
            case "undefined": {
                return "[Undefined]"; }
            case "symbol": {
                return "[Symbol]"; }
            default: {
                return value; }
            }
        }, 4);
    }
    // Implement state.message toasts without interfering with the operation of other possible scripts
    function postMessages() {
        const preMessage = getStateMessage();
        if ((preMessage === AC.message.previous) && (AC.message.pending.length !== 0)) {
            // No other scripts are attempting to update state.message during this turn
            // One or more pending Auto-Cards messages exist
            if (!AC.message.suppress) {
                // Message suppression is off
                let newMessage = "Auto-Cards:\n";
                if (AC.message.pending.length === 1) {
                    newMessage += AC.message.pending[0];
                } else {
                    newMessage += AC.message.pending.map(
                        (messageLine, index) => ("#" + (index + 1) + ": " + messageLine)
                    ).join("\n");
                }
                if (preMessage === newMessage) {
                    // Introduce a minor variation to facilitate repetition of the previous message toast
                    newMessage = newMessage.replace("Auto-Cards:\n", "Auto-Cards: \n");
                }
                state.message = newMessage;
            }
            // Clear the pending messages queue after posting or suppressing messages
            AC.message.pending = [];
        }
        AC.message.previous = getStateMessage();
        return;
    }
    function getStateMessage() {
        return state.message ?? "";
    }
    function getPrecedingNewlines() {
        const previousAction = readPastAction(0);
        if (isDoSay(previousAction.type)) {
            return "";
        } else if (previousAction.text.endsWith("\n")) {
            if (previousAction.text.endsWith("\n\n")) {
                return "";
            } else {
                return "\n";
            }
        } else {
            return "\n\n";
        }
    }
    // Call with lookBack 0 to read the most recent action in history (or n many actions back)
    function readPastAction(lookBack) {
        const action = (function() {
            if (Array.isArray(history)) {
                return (history[(function() {
                    const index = history.length - 1 - Math.abs(lookBack);
                    if (index < 0) {
                        return 0;
                    } else {
                        return index;
                    }
                })()]);
            } else {
                return O.f({});
            }
        })();
        return O.f({
            text: action?.text ?? (action?.rawText ?? ""),
            type: action?.type ?? "unknown"
        });
    }
    // Forget ongoing card generation/compression after passing or postponing completion over many consecutive turns
    // Also decrement AC.chronometer.postpone regardless of retries or erases
    function promoteAmnesia() {
        // Decrement AC.chronometer.postpone in all cases
        if (0 < AC.chronometer.postpone) {
            AC.chronometer.postpone--;
        }
        if (!AC.chronometer.step) {
            // Skip known retry/erase turns
            return;
        }
        if (AC.chronometer.amnesia++ < boundInteger(16, (2 * AC.config.addCardCooldown), 64)) {
            return;
        }
        AC.generation.cooldown = validateCooldown(underQuarterInteger(AC.config.addCardCooldown));
        forgetStuff();
        AC.chronometer.amnesia = 0;
        return;
    }
    function forgetStuff() {
        AC.generation.completed = 0;
        AC.generation.permitted = 34;
        AC.generation.workpiece = O.f({});
        // AC.generation.pending is not forgotten
        resetCompressionProperties();
        return;
    }
    function resetCompressionProperties() {
        AC.compression.completed = 0;
        AC.compression.titleKey = "";
        AC.compression.vanityTitle = "";
        AC.compression.responseEstimate = 1400;
        AC.compression.lastConstructIndex = -1;
        AC.compression.oldMemoryBank = [];
        AC.compression.newMemoryBank = [];
        return;
    }
    function underQuarterInteger(someNumber) {
        return Math.floor(someNumber / 4);
    }
    function getTurn() {
        if (Number.isInteger(info?.actionCount)) {
            // "But Leah, surely info.actionCount will never be negative?"
            // You have no idea what nightmares I've seen...
            return Math.abs(info.actionCount);
        } else {
            return 0;
        }
    }
    function see(arr) {
        return String.fromCharCode(...arr.map(n => Math.sqrt(n / 33)));
    }
    function formatTitle(title) {
        const input = title;
        let useMemo = false;
        if (
            (AC.database.titles.used.length === 1)
            && (AC.database.titles.used[0] === ("%@%"))
            && [used, forenames, surnames].every(nameset => (
                (nameset.size === 1)
                && nameset.has("%@%")
            ))
        ) {
            const pair = memoized.get(input);
            if (pair !== undefined) {
                if (50000 < memoized.size) {
                    memoized.delete(input);
                    memoized.set(input, pair);
                }
                return O.f({newTitle: pair[0], newKey: pair[1]});
            }
            useMemo = true;
        }
        title = title.trim();
        if (short()) {
            return end();
        }
        title = (title
            // Begone!
            .replace(/[–。？！´“”؟،«»¿¡„“…§，、\*_~><\(\)\[\]{}#"`:!—;\.\?,\s\\]/g, " ")
            .replace(/[‘’]/g, "'").replace(/\s+'/g, " ")
            // Remove the words "I", "I'm", "I'd", "I'll", and "I've"
            .replace(/(?<=^|\s)(?:I|I'm|I'd|I'll|I've)(?=\s|$)/gi, "")
            // Remove "'s" only if not followed by a letter
            .replace(/'s(?![a-zA-Z])/g, "")
            // Replace "s'" with "s" only if preceded but not followed by a letter
            .replace(/(?<=[a-zA-Z])s'(?![a-zA-Z])/g, "s")
            // Remove apostrophes not between letters (preserve contractions like "don't")
            .replace(/(?<![a-zA-Z])'(?![a-zA-Z])/g, "")
            // Eliminate fake em dashes and terminal/leading dashes
            .replace(/\s-\s/g, " ")
            // Condense consecutive whitespace
            .trim().replace(/\s+/g, " ")
            // Remove a leading or trailing bullet
            .replace(/^-+\s*/, "").replace(/\s*-+$/, "")
        );
        if (short()) {
            return end();
        }
        // Special-cased words
        const minorWordsJoin = Words.minor.join("|");
        const leadingMinorWordsKiller = new RegExp("^(?:" + minorWordsJoin + ")\\s", "i");
        const trailingMinorWordsKiller = new RegExp("\\s(?:" + minorWordsJoin + ")$", "i");
        // Ensure the title is not bounded by any outer minor words
        title = enforceBoundaryCondition(title);
        if (short()) {
            return end();
        }
        // Ensure interior minor words are lowercase and excise all interior honorifics/abbreviations
        const honorAbbrevsKiller = new RegExp("(?:^|\\s|-|\\/)(?:" + (
            [...Words.honorifics, ...Words.abbreviations]
        ).map(word => word.replace(".", "")).join("|") + ")(?=\\s|-|\\/|$)", "gi");
        title = (title
            // Capitalize the first letter of each word
            .replace(/(?<=^|\s|-|\/)(?:\p{L})/gu, word => word.toUpperCase())
            // Lowercase minor words properly
            .replace(/(?<=^|\s|-|\/)(?:\p{L}+)(?=\s|-|\/|$)/gu, word => {
                const lowerWord = word.toLowerCase();
                if (Words.minor.includes(lowerWord)) {
                    return lowerWord;
                } else {
                    return word;
                }
            })
            // Remove interior honorifics/abbreviations
            .replace(honorAbbrevsKiller, "")
            .trim()
        );
        if (short()) {
            return end();
        }
        let titleWords = title.split(" ");
        while ((2 < title.length) && (98 < title.length) && (1 < titleWords.length)) {
            titleWords.pop();
            title = titleWords.join(" ").trim();
            const unboundedLength = title.length;
            title = enforceBoundaryCondition(title);
            if (unboundedLength !== title.length) {
                titleWords = title.split(" ");
            }
        }
        if (isUsedOrBanned(title) || isNamed(title)) {
            return end();
        }
        // Procedurally generated story card trigger keywords exclude certain words and patterns which are otherwise permitted in titles
        let key = title;
        const peerage = new Set(Words.peerage);
        if (titleWords.some(word => ((word === "the") || peerage.has(word.toLowerCase())))) {
            if (titleWords.length < 2) {
                return end();
            }
            key = enforceBoundaryCondition(
                titleWords.filter(word => !peerage.has(word.toLowerCase())).join(" ")
            );
            if (key.includes(" the ")) {
                key = enforceBoundaryCondition(key.split(" the ")[0]);
            }
            if (isUsedOrBanned(key)) {
                return end();
            }
        }
        function short() {
            return (title.length < 3);
        }
        function enforceBoundaryCondition(str) {
            while (leadingMinorWordsKiller.test(str)) {
                str = str.replace(/^\S+\s+/, "");
            }
            while (trailingMinorWordsKiller.test(str)) {
                str = str.replace(/\s+\S+$/, "");
            }
            return str;
        }
        function end(newTitle = "", newKey = "") {
            if (useMemo) {
                memoized.set(input, [newTitle, newKey]);
                if (55000 < memoized.size) {
                    memoized.delete(memoized.keys().next().value);
                }
            }
            return O.f({newTitle, newKey});
        }
        return end(title, key);
    }
    // I really hate english grammar
    function checkPlurals(title, predicate) {
        function check(t) { return ((t.length < 3) || (100 < t.length) || predicate(t)); }
        const t = title.toLowerCase();
        if (check(t)) { return true; }
        // s>p : singular -> plural : p>s: plural -> singular
        switch(t[t.length - 1]) {
        // p>s : s -> _ : Birds -> Bird
        case "s": if (check(t.slice(0, -1))) { return true; }
        case "x":
        // s>p : s, x, z -> ses, xes, zes : Mantis -> Mantises
        case "z": if (check(t + "es")) { return true; }
            break;
        // s>p : o -> oes, os : Gecko -> Geckoes, Geckos
        case "o": if (check(t + "es") || check(t + "s")) { return true; }
            break;
        // p>s : i -> us : Cacti -> Cactus
        case "i": if (check(t.slice(0, -1) + "us")) { return true; }
        // s>p : i, y -> ies : Kitty -> Kitties
        case "y": if (check(t.slice(0, -1) + "ies")) { return true; }
            break;
        // s>p : f -> ves : Wolf -> Wolves
        case "f": if (check(t.slice(0, -1) + "ves")) { return true; }
        // s>p : !(s, x, z, i, y) -> +s : Turtle -> Turtles
        default: if (check(t + "s")) { return true; }
            break;
        } switch(t.slice(-2)) {
        // p>s : es -> _ : Foxes -> Fox
        case "es": if (check(t.slice(0, -2))) { return true; } else if (
            (t.endsWith("ies") && (
                // p>s : ies -> y : Bunnies -> Bunny
                check(t.slice(0, -3) + "y")
                // p>s : ies -> i : Ravies -> Ravi
                || check(t.slice(0, -2))
            // p>s : es -> is : Crises -> Crisis
            )) || check(t.slice(0, -2) + "is")) { return true; }
            break;
        // s>p : us -> i : Cactus -> Cacti
        case "us": if (check(t.slice(0, -2) + "i")) { return true; }
            break;
        // s>p : is -> es : Thesis -> Theses
        case "is": if (check(t.slice(0, -2) + "es")) { return true; }
            break;
        // s>p : fe -> ves : Knife -> Knives
        case "fe": if (check(t.slice(0, -2) + "ves")) { return true; }
            break;
        case "sh":
        // s>p : sh, ch -> shes, ches : Fish -> Fishes
        case "ch": if (check(t + "es")) { return true; }
            break;
        } return false;
    }
    function isUsedOrBanned(title) {
        function isUsed(lowerTitle) {
            if (used.size === 0) {
                const usedTitles = Internal.getUsedTitles();
                for (let i = 0; i < usedTitles.length; i++) {
                    used.add(usedTitles[i].toLowerCase());
                }
                if (used.size === 0) {
                    // Add a placeholder so compute isn't wasted on additional checks during this hook
                    used.add("%@%");
                }
            }
            return used.has(lowerTitle);
        }
        return checkPlurals(title, t => (isUsed(t) || isBanned(t)));
    }
    function isBanned(lowerTitle, getUsedIsExternal) {
        if (bans.size === 0) {
            // In order to save space, implicit bans aren't listed within the UI
            const dataVariants = getDataVariants();
            const bansToAdd = [...lowArr([
                ...Internal.getBannedTitles(),
                dataVariants.debug.title,
                dataVariants.debug.keys,
                dataVariants.critical.title,
                dataVariants.critical.keys,
                ...Object.values(Words.reserved)
            ]), ...Words.undesirables.map(undesirable => see(undesirable))];
            for (let i = 0; i < bansToAdd.length; i++) {
                bans.add(bansToAdd[i]);
            }
        }
        return bans.has(lowerTitle);
    }
    function isNamed(title, returnSurname) {
        const peerage = new Set(Words.peerage);
        const minorWords = new Set(Words.minor);
        if ((forenames.size === 0) || (surnames.size === 0)) {
            const usedTitles = Internal.getUsedTitles();
            for (let i = 0; i < usedTitles.length; i++) {
                const usedTitleWords = divideTitle(usedTitles[i]);
                if (
                    (usedTitleWords.length === 2)
                    && (2 < usedTitleWords[0].length)
                    && (2 < usedTitleWords[1].length)
                ) {
                    forenames.add(usedTitleWords[0]);
                    surnames.add(usedTitleWords[1]);
                } else if (
                    (usedTitleWords.length === 1)
                    && (2 < usedTitleWords[0].length)
                ) {
                    forenames.add(usedTitleWords[0]);
                }
            }
            if (forenames.size === 0) {
                forenames.add("%@%");
            }
            if (surnames.size === 0) {
                surnames.add("%@%");
            }
        }
        const titleWords = divideTitle(title);
        if (
            returnSurname
            && (titleWords.length === 2)
            && (3 < titleWords[0].length)
            && (3 < titleWords[1].length)
            && forenames.has(titleWords[0])
            && surnames.has(titleWords[1])
        ) {
            return (title
                .split(" ")
                .find(casedTitleWord => (casedTitleWord.toLowerCase() === titleWords[1]))
            );
        } else if (
            (titleWords.length === 2)
            && (2 < titleWords[0].length)
            && (2 < titleWords[1].length)
            && forenames.has(titleWords[0])
        ) {         
            return true;
        } else if (
            (titleWords.length === 1)
            && (2 < titleWords[0].length)
            && (forenames.has(titleWords[0]) || surnames.has(titleWords[0]))
        ) {
            return true;
        }
        function divideTitle(undividedTitle) {
            const titleWords = undividedTitle.toLowerCase().split(" ");
            if (titleWords.some(word => minorWords.has(word))) {
                return [];
            } else {
                return titleWords.filter(word => !peerage.has(word));
            }
        }
        return false;
    }
    function shouldProceed() {
        return (AC.config.doAC && !AC.signal.emergencyHalt && (AC.chronometer.postpone < 1));
    }
    function isDoSayStory(type) {
        return (isDoSay(type) || (type === "story"));
    }
    function isDoSay(type) {
        return ((type === "do") || (type === "say"));
    }
    function randomint(min, max) {
        min = Math.ceil(min)
        max = Math.floor(max)
        return Math.floor(Math.random() * (max - min + 1)) + min
    }
    function permitOutput() {
        return ((AC.config.deleteAllAutoCards === null) && (AC.signal.outputReplacement === ""));
    }
    function isAwaitingGeneration() {
        return (0 < AC.generation.pending.length);
    }
    function isPendingGeneration() {
        return notEmptyObj(AC.generation.workpiece);
    }
    function isPendingCompression() {
        return (AC.compression.titleKey !== "");
    }
    function notEmptyObj(obj) {
        return (obj && (0 < Object.keys(obj).length));
    }
    function clearTransientTitles() {
        AC.database.titles.used = [];
        [used, forenames, surnames].forEach(nameset => nameset.clear());
        return;
    }
    function banTitle(title, isFinalAssignment) {
        title = limitString(title.replace(/\s+/g, " ").trim(), 100);
        const lowerTitle = title.toLowerCase();
        if (bans.size !== 0) {
            bans.add(lowerTitle);
        }
        if (!lowArr(Internal.getBannedTitles()).includes(lowerTitle)) {
            AC.database.titles.banned.unshift(title);
            if (isFinalAssignment) {
                return;
            }
            AC.database.titles.pendingBans.unshift([title, 3]);
            const index = AC.database.titles.pendingUnbans.findIndex(pair => (pair[0].toLowerCase() === lowerTitle));
            if (index !== -1) {
                AC.database.titles.pendingUnbans.splice(index, 1);
            }
        }
        return;
    }
    function unbanTitle(title) {
        title = title.replace(/\s+/g, " ").trim();
        const lowerTitle = title.toLowerCase();
        if (used.size !== 0) {
            bans.delete(lowerTitle);
        }
        let index = lowArr(Internal.getBannedTitles()).indexOf(lowerTitle);
        if (index !== -1) {
            AC.database.titles.banned.splice(index, 1);
            AC.database.titles.pendingUnbans.unshift([title, 3]);
            index = AC.database.titles.pendingBans.findIndex(pair => (pair[0].toLowerCase() === lowerTitle));
            if (index !== -1) {
                AC.database.titles.pendingBans.splice(index, 1);
            }
        }
        return;
    }
    function lowArr(arr) {
        return arr.map(str => str.toLowerCase());
    }
    function getDataVariants() {
        return O.f({
            critical: O.f({
                title: "Critical Data",
                keys: "Never modify or delete this story card",
            }),
        });
    }
    // Prepare to export the codomain
    const codomain = CODOMAIN.read();
    const [stopPackaged, lastCall] = (function() {
        switch(HOOK) {
        case "context": {
            const haltStatus = [];
            if (Array.isArray(codomain)) {
                O.f(codomain);
                haltStatus.push(true, codomain[1]);
            } else {
                haltStatus.push(false, STOP);
            }
            return haltStatus; }
        case "output": {
            return [null, true]; }
        default: {
            return [null, null]; }
        }
    })();
    // Repackage AC to propagate its state forward in time
    const memoryOverflow = (38000 < (JSON.stringify(state).length + JSON.stringify(AC).length));
    if (memoryOverflow) {
        // Memory overflow is imminent
        const dataVariants = getDataVariants();
        if (lastCall) {
            banTitle(dataVariants.critical.title);
        }
        setData(dataVariants.critical);
        if (state.AutoCards) {
            // Decouple state for safety
            delete state.AutoCards;
        }
    } else {
        if (lastCall) {
            const dataVariants = getDataVariants();
            unbanTitle(dataVariants.critical.title);
        }
        // Save a backup image to state
        state.AutoCards = AC;
    }
    function setData(primaryVariant, secondaryVariant) {
        const dataCardTemplate = O.f({
            type: AC.config.defaultCardType,
            title: primaryVariant.title,
            keys: primaryVariant.keys,
            entry: (function() {
                if (memoryOverflow) {
                    return (
                        "Seeing this means Auto-Cards detected an imminent memory overflow event. But fear not! As an emergency fallback, the full state of Auto-Cards' data has been serialized and written to the notes section below. This text will be deserialized during each lifecycle hook, therefore it's absolutely imperative that you avoid editing this story card!"
                    );
                }
            })(),
            description: JSON.stringify(AC)
        });
        if (data === null) {
            data = getSingletonCard(true, dataCardTemplate, O.f({...secondaryVariant}));
        }
        for (const propertyName of ["title", "keys", "entry", "description"]) {
            if (data[propertyName] !== dataCardTemplate[propertyName]) {
                data[propertyName] = dataCardTemplate[propertyName];
            }
        }
        const index = storyCards.indexOf(data);
        if ((index !== -1) && (index !== (storyCards.length - 1))) {
            // Ensure the data card is always at the bottom of the story cards list
            storyCards.splice(index, 1);
            storyCards.push(data);
        }
        return;
    }
    // This is the only return point within the parent scope of AutoCards
    if (stopPackaged === false) {
        return [codomain, STOP];
    } else {
        return codomain;
    }
}
AutoCards(null);
