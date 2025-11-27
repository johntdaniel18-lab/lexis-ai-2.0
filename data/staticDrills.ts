
import { StaticDrillModule } from '../types';

export const STATIC_DRILLS: StaticDrillModule[] = [
  {
    id: 'grammar-passive-01',
    title: 'The Passive Voice in Process Diagrams',
    description: 'Master the essential grammar for describing manufacturing and natural processes in Task 1.',
    category: 'Grammar',
    difficulty: 'Intermediate',
    tags: ['Task 1', 'Process Diagram', 'Grammar'],
    lessonContent: `
# Mastering the Passive Voice

In IELTS Writing Task 1, especially when describing **process diagrams** (how things are made), the passive voice is your most important tool.

### Why use it?
When describing a process, we care about **what happens** to the object, not **who** does it.

*   **Active:** *The machine washes the apples.* (Focus on the machine)
*   **Passive:** *The apples **are washed**.* (Focus on the apples)

### How to form it
**Subject + be + past participle**

*   *Present Simple:* is / are + eaten
    *   "The tea leaves **are picked** by hand."
*   *After modal verbs:* can / must / should + be + eaten
    *   "The plastic **must be melted** down."
*   *Sequencing:* Once the apples **have been picked**, they are transported...

### Common Process Verbs
*   **Production:** produced, manufactured, created
*   **Movement:** transported, moved, sent, delivered
*   **Transformation:** heated, frozen, ground, crushed, dried
    `,
    groups: [
      {
        id: 'g1',
        type: 'MCQ',
        title: 'Questions 1-2: Structure Identification',
        instruction: 'Choose the correct sentence that describes the process step.',
        questions: [
          {
            id: 'q1',
            text: 'Which sentence correctly uses the passive voice to describe the image?',
            options: [
              'The farmers are picking the coffee beans.',
              'The coffee beans are picked by hand.',
              'The coffee beans pick by hand.',
              'Hand picking the coffee beans.'
            ],
            correctAnswer: '1',
            explanation: '"The coffee beans are picked" puts the focus on the object (beans) receiving the action.'
          },
          {
            id: 'q4',
            text: 'Select the correct sequencing structure.',
            options: [
              'After the tea is drying, it is packed.',
              'Once the tea has been dried, it is packed.',
              'Before the tea is dried, it is packed.',
              'The tea dried and then packed.'
            ],
            correctAnswer: '1',
            explanation: '"Once + present perfect passive" (has been dried) effectively shows that one step is fully finished before the next begins.'
          }
        ]
      },
      {
        id: 'g2',
        type: 'NOTES_COMPLETION',
        title: 'Question 3: Sentence Completion',
        instruction: 'Complete the sentence describing the step. Type the correct verb form.',
        content: 'After the apples are cleaned, they {{q2}} into boxes for transport.',
        questions: [
          {
            id: 'q2',
            correctAnswer: ['are packed', 'are placed', 'are put'],
            explanation: 'We need the present passive form: "are" + "past participle" (packed/placed).'
          }
        ]
      },
      {
        id: 'g3',
        type: 'MATCHING',
        title: 'Question 4: Verb Transformation',
        instruction: 'Match the active verb with its correct passive form.',
        sharedOptions: ['Is ground', 'Is sent', 'Is held', 'Is frozen'],
        questions: [
          { id: 'p1', text: 'Grind', correctAnswer: '0', explanation: 'Irregular verb: Grind -> Ground' },
          { id: 'p2', text: 'Send', correctAnswer: '1', explanation: 'Irregular verb: Send -> Sent' },
          { id: 'p3', text: 'Hold', correctAnswer: '2', explanation: 'Irregular verb: Hold -> Held' },
          { id: 'p4', text: 'Freeze', correctAnswer: '3', explanation: 'Irregular verb: Freeze -> Frozen' }
        ]
      }
    ]
  },
  {
    id: 'coherence-linking-01',
    title: 'Contrast Connectors',
    description: 'Learn how to sophisticatedly link contrasting ideas to boost your Coherence score.',
    category: 'Coherence',
    difficulty: 'Advanced',
    tags: ['Task 2', 'Linking Words', 'Structure'],
    lessonContent: `
# Expressing Contrast

High-scoring essays often present a complex argument by showing two sides of an issue. To do this, you need varied contrast connectors.

### Within a Sentence (Conjunctions/Prepositions)
*   **While / Whereas:** Used to contrast two distinct clauses.
    *   *"**While** electric cars are cleaner, they are still expensive."*
*   **Despite / In spite of:** Followed by a Noun or "Verb-ing".
    *   *"**Despite** the cost, many people prefer organic food."*
    *   *"**In spite of being** tired, he finished the essay."*

### Starting a New Sentence (Adverbs)
*   **However / On the other hand:** Used to introduce a contrasting idea in a new sentence. Always followed by a comma.
    *   *"Online learning is convenient. **However**, it lacks social interaction."*
*   **Conversely / In contrast:** more formal options for Academic writing.
    `,
    groups: [
      {
        id: 'g1',
        type: 'MCQ',
        title: 'Question 1',
        instruction: 'Choose the correct connector.',
        questions: [
          {
            id: 'q1',
            text: 'Choose the correct connector to complete the sentence.',
            options: [
              'Despite',
              'Although',
              'However',
              'In spite of'
            ],
            correctAnswer: '1',
            explanation: '"Although" is a subordinating conjunction followed by a subject and a verb clause ("it was raining"). "Despite" requires a noun phrase.'
          }
        ]
      },
      {
        id: 'g2',
        type: 'NOTES_COMPLETION',
        title: 'Question 2',
        instruction: 'Fill in the blank with a suitable connector.',
        content: 'Sales of laptops increased significantly, {{q2}} sales of desktop computers saw a sharp decline.',
        questions: [
          {
            id: 'q2',
            correctAnswer: ['whereas', 'while', 'whilst'],
            explanation: '"Whereas" or "While" are perfect for contrasting two trends in the same sentence.'
          }
        ]
      },
      {
        id: 'g3',
        type: 'MATCHING',
        title: 'Question 3',
        instruction: 'Match the connector to its grammatical rule.',
        sharedOptions: ['Followed by a comma, starts new sentence', 'Followed by a Noun Phrase', 'Connects two clauses in one sentence', 'Used to deny a previous statement'],
        questions: [
          { id: 'p1', text: 'However', correctAnswer: '0' },
          { id: 'p2', text: 'Despite', correctAnswer: '1' },
          { id: 'p3', text: 'Whereas', correctAnswer: '2' },
          { id: 'p4', text: 'On the contrary', correctAnswer: '3' }
        ]
      }
    ]
  },
  {
    id: 'vocab-environment-01',
    title: 'Environment & Climate Change',
    description: 'Essential Band 8+ vocabulary for one of the most common IELTS topics.',
    category: 'Vocabulary',
    difficulty: 'Intermediate',
    tags: ['Task 2', 'Environment', 'Vocabulary'],
    lessonContent: `
# Environmental Vocabulary

To score high in Lexical Resource on environmental topics, you need precise terms.

### Key Collocations
*   **Irreparable damage:** Damage that cannot be fixed.
*   **Reduce one's carbon footprint:** Lower the amount of CO2 you produce.
*   **Sustainable development:** Economic growth that doesn't harm the future.
*   **Depletion of natural resources:** Running out of things like oil, gas, or water.
    `,
    groups: [
      {
        id: 'g1',
        type: 'MATCHING',
        title: 'Questions 1-4',
        instruction: 'Match the word to its definition.',
        sharedOptions: ['Make less severe', 'Reduction in quantity', 'Able to be maintained at a certain rate', 'Capable of being decomposed by bacteria'],
        questions: [
          { id: 'p1', text: 'Mitigate', correctAnswer: '0' },
          { id: 'p2', text: 'Depletion', correctAnswer: '1' },
          { id: 'p3', text: 'Sustainable', correctAnswer: '2' },
          { id: 'p4', text: 'Biodegradable', correctAnswer: '3' }
        ]
      },
      {
        id: 'g2',
        type: 'NOTES_COMPLETION',
        title: 'Question 5',
        instruction: 'Complete the sentence with the correct verb.',
        content: 'Governments must take steps to {{q2}} the effects of global warming.',
        questions: [
          {
            id: 'q2',
            correctAnswer: ['mitigate', 'alleviate', 'reduce'],
            explanation: '"Mitigate" is a formal academic verb often used with "effects", "risks", or "problems".'
          }
        ]
      },
      {
        id: 'g3',
        type: 'MCQ',
        title: 'Question 6',
        instruction: 'Select the best phrase.',
        questions: [
          {
            id: 'q3',
            text: 'Which phrase best describes "running out of oil and gas"?',
            options: [
              'The finishing of fossil fuels',
              'The depletion of natural resources',
              'The empty nature reserves',
              'The lowering of gas stocks'
            ],
            correctAnswer: '1',
            explanation: '"Depletion of natural resources" is a standard academic collocation.'
          }
        ]
      }
    ]
  },
  {
    id: "task1-maps-paraphrasing-01",
    title: "Mastering Paraphrasing for IELTS Task 1 Maps",
    description: "Learn essential vocabulary and grammatical structures to paraphrase map changes, locations, and prompts effectively.",
    category: "Vocabulary",
    difficulty: "Intermediate",
    tags: [
      "IELTS Writing",
      "Task 1",
      "Maps",
      "Paraphrasing",
      "Grammar"
    ],
    lessonContent: `
# Paraphrasing Strategies for Task 1 Maps

In IELTS Writing Task 1, you must describe changes between two maps (e.g., a village in 2010 vs. 2024). High-scoring essays avoid repeating the same words from the prompt and use specific vocabulary to describe transformations.

## 1. Paraphrasing the Introduction
Never copy the question prompt word-for-word. Use synonyms:
* **Show:** Illustrate, depict, display, compare.
* **Development:** Evolution, changes, transformation, modernization.
* **Time Period:** Instead of "between 2000 and 2010," write "over a ten-year period" or "during the decade from 2000 to 2010."

## 2. Essential Verbs of Change
To paraphrase effectively, categorize changes into three types:

### A. Expansion (Building/Adding)
* **Constructed / Erected:** Used for buildings/structures (e.g., "A new hotel was erected...").
* **Expanded / Extended:** Used for making something bigger (e.g., "The car park was expanded...").

### B. Removal (Destroying)
* **Demolished / Knocked down / Flattened:** Used for buildings.
* **Cut down / Cleared:** Used for trees/forests.
* **Make way for:** A high-level phrase explaining why something was removed (e.g., "The houses were demolished to make way for a stadium.").

### C. Transformation (Changing Function)
* **Converted into / Transformed into:** (e.g., "The old warehouse was converted into a gallery.").
* **Replaced by:** (e.g., "The market was replaced by a supermarket.").
    `,
    groups: [
      {
        id: "g1",
        type: "MATCHING",
        title: "Questions 1-4: Synonyms",
        instruction: "Match the basic verbs on the left with their more advanced synonyms suitable for Map descriptions.",
        sharedOptions: ["Flattened", "Erected", "Converted", "Expanded"],
        questions: [
          { id: "pair-1", text: "Demolished", correctAnswer: "0" },
          { id: "pair-2", text: "Built", correctAnswer: "1" },
          { id: "pair-3", text: "Changed (function)", correctAnswer: "2" },
          { id: "pair-4", text: "Became bigger", correctAnswer: "3" }
        ]
      },
      {
        id: "g2",
        type: "MCQ",
        title: "Questions 5-6: Grammar & Paraphrasing",
        instruction: "Choose the best option.",
        questions: [
          {
            id: "ex-mcq-intro-paraphrase",
            text: "Select the best paraphrase for the following prompt: 'The maps below show the changes that took place in the village of Stokeford between 1930 and 2010.'",
            options: [
              "The maps below display the village of Stokeford in 1930 and 2010.",
              "The diagrams illustrate how the village of Stokeford developed over an 80-year period.",
              "The pictures explain the growth of Stokeford village in 80 years.",
              "The charts compare the Stokeford village changes from 1930 to 2010."
            ],
            correctAnswer: "1",
            explanation: "Option 2 uses 'illustrate' for 'show', calculates the time difference ('over an 80-year period'), and uses 'developed' to summarize 'changes'."
          },
          {
            id: "ex-mcq-passive-voice",
            text: "Which sentence correctly uses the Passive Voice to describe a change?",
            options: [
              "The forest was cutting down to build a school.",
              "A school constructed where the forest used to be.",
              "The forest was cleared to make way for a school.",
              "They were chopping down the forest for a school."
            ],
            correctAnswer: "2",
            explanation: "Option 3 correctly uses the passive 'was cleared'."
          }
        ]
      },
      {
        id: "g3",
        type: "NOTES_COMPLETION",
        title: "Questions 7-8: Vocabulary in Context",
        instruction: "Complete the sentences with the correct vocabulary.",
        content: "The residential houses were completely demolished to {{q7}} a new industrial complex. Meanwhile, the old bank was {{q8}} into a modern restaurant.",
        questions: [
          {
            id: "q7",
            correctAnswer: ["make way for", "make room for"],
            explanation: "'Make way for' is idiomatic for describing replacement."
          },
          {
            id: "q8",
            correctAnswer: ["converted", "transformed", "redeveloped", "renovated"],
            explanation: "Verbs like 'converted' or 'transformed' (+ into) are accurate for changing function."
          }
        ]
      }
    ]
  }
];
