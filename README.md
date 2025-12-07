# Auto-Cards

## Overview

Auto-Cards is a sophisticated scripting enhancement for AI Dungeon that provides a dynamic and persistent world-state through the automatic generation and management of story cards. It addresses the challenge of object permanence in AI-driven narratives by creating a comprehensive, in-game reference of key plot elements as the story unfolds. This system operates in the background, requiring no direct user intervention during gameplay.

## Core Features

- **Automatic Story Card Generation:** The script intelligently identifies named entities and significant plot points within the narrative, automatically generating relevant story cards. This ensures that crucial information is preserved and accessible throughout the adventure.

- **Dynamic Memory Management:** Auto-Cards employs a smart memory update system that summarizes and condenses long-term memories associated with each card. This prevents memory bank overflow while retaining essential details, ensuring a coherent and consistent narrative over extended gameplay sessions.

- **Customizable AI Prompts:** Users can fully customize the AI prompts used for both card generation and memory summarization. This allows for fine-tuning the style, tone, and content of the generated cards to match the specific needs of the story.

- **Automated Inventory Tracking:** The script includes a built-in inventory management system. It automatically creates and updates a dedicated "Inventory" card, tracking items as they are acquired or lost based on keyword triggers in the narrative.

- **Plot Hook Detection:** Auto-Cards can identify and create story cards for plot hooks, quests, and objectives, ensuring that important story arcs are not forgotten.

## Technical Details

The script operates by intercepting and modifying the `input`, `context`, and `output` of the AI Dungeon model. It parses the narrative for keywords and named entities, and when certain conditions are met, it injects a specialized prompt into the AI's context to generate a story card. The script then captures the AI's output, formats it, and creates or updates the relevant card.

The inventory system functions by monitoring the narrative for keywords related to item acquisition and loss. When a keyword is detected, the script updates the "Inventory" card with the new item and its quantity. If a card for the item does not already exist, one is generated automatically.

Auto-Cards is designed to be highly compatible with other AI Dungeon scripts and includes an external API for advanced users who wish to integrate it with their own projects.
