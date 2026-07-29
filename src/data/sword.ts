// The Boy and the Sword, in beats. Each beat carries what the boy gains
// or loses at that moment, which drives the satchel as the reader scrolls.
// Text is Jake's final draft, verbatim apart from four plain typo fixes
// (scraped, that he cracked, had run into, a doubled space).

export type Grant =
  | { get: "sword" }
  | { lose: "sword" }
  | { get: "egg" }
  | { get: "stick" }
  | { get: "fish" }
  | { get: "wood" }
  | { get: "fire" };

export interface Beat {
  id: string;
  paras: string[];
  grant?: Grant;
  /** A line pulled out and set on its own, for pacing. */
  pull?: string;
}

export const beats: Beat[] = [
  {
    id: "sword",
    grant: { get: "sword" },
    paras: [
      "Once there was a boy. He had a sword. It was the most amazing sword. Not like most regular old swords. This sword had a touch of magic. This sword knew exactly what the boy wanted to do and would do just that. Just today, for example, the boy wanted a fried egg for breakfast. So, the sword cut an eggshell right off of an egg. Heated itself up. And fried an egg right there on its blade while the boy held it.",
    ],
  },
  {
    id: "gone",
    grant: { lose: "sword" },
    paras: [
      "That day he had chopped down trees for his fire, speared fish while wading in the river, and of course fried an egg. Needless to say, he didn't know how to do any of those things without the sword. All the fun he had had with the sword had worn him out. That night, he was so tired he fell asleep while holding his sword. And that night, he dreamed that one day he may be able to chop his own wood, and spear his own fish, and fry his own egg. When he awoke the sword was gone.",
    ],
  },
  {
    id: "silly",
    paras: [
      "He wasn't sure what he should do now that the sword was gone. Yet, he felt a sense that he should look for the magic sword. He thought, “life will be rather boring without this sword.” Although, it will be much too hard to find the sword. A regular sword would be easy enough to find. But a magic sword is another thing entirely. He thought that he might be able to find the magic sword if he still had the magic sword he was looking for to guide him. What a silly thought.",
    ],
  },
  {
    id: "boring",
    paras: [
      "So, the boy sat and the day went on, and the boy did not have any fun that day. When he went to bed that night it took him much longer to fall asleep than the night before. A beam of light shot across the edge of his bed from his father's door across the room. He thought to himself as he lay, “How boring life is without this sword. I must find it.” “Tomorrow I will go and find the sword.” But when he awoke, he wasn't nearly as convicted to look for the sword. Even though he had remembered the thoughts that he had before bed. Why should he look for the sword? Where would he even start? So he went about his day. But his day wasn't very fun. And he had trouble falling asleep yet again. The same thoughts.",
    ],
  },
  {
    id: "egg",
    grant: { get: "egg" },
    paras: [
      "When the boy awoke, he decided he must go find the sword. First, he went to the kitchen where he would fry eggs with his sword. He looked and looked but didn't see the sword anywhere. At this point it was later in the morning and he was getting rather hungry. He had seen a pan in one of the cupboards when he was looking for the sword. So, he got the pan out, cracked an egg, turned on the stove and fried himself an egg. It was a little runnier than he liked. But, after this he had enough energy to keep looking for the sword.",
    ],
  },
  {
    id: "stick",
    grant: { get: "stick" },
    paras: [
      "Next, he went to the river to see if the sword had wandered off to where he liked to spear fish. While walking to the river he tripped over a long stick and scraped his knee. It was all bloody now. He was close enough to the river that he could clean off there and the stick he tripped over was such a lovely stick. He kept the stick and used it to hike to the river.",
    ],
  },
  {
    id: "fish",
    grant: { get: "fish" },
    paras: [
      "He waded into the river and cleaned off his knee. The water was extra refreshing today and felt like magic on his knee. He had never noticed how nice the water felt. Even so, this would not distract his search, he didn't want to have any more not fun boring days. As the boy put his head under the water a fish the size of a full-grown man darted right toward him. He instinctively pointed his stick toward the fish and the fish speared itself right on his lovely stick. The boy gasped as his head came out of the water. What a terrible experience. That had never happened when he had his magic sword. And alas there was still no sword.",
    ],
  },
  {
    id: "wood",
    grant: { get: "wood" },
    paras: [
      "The boy headed to the forest to look for the sword. He looked and looked all over the forest floor. But the sword was nowhere to be found. He thought to himself that the sword has gotten itself stuck in a tree. You never know what those magic swords are capable of. He climbed to the top of a tree that he thought was good for climbing. But he had never climbed trees before so he actually didn't know which trees are good for climbing. Right as he got to the top of this tree, he heard a crack. The tree came tumbling down. The boy hit the ground hard. But he was ok because it wasn't that big of a tree. He was disappointed because he didn't find the sword. And his head hurt from the fall.",
    ],
  },
  {
    id: "home",
    grant: { get: "fire" },
    paras: [
      "The sun was setting so he decided to walk home. As he thought about the sword, it was a sad walk. But he also thought about how he had some wood for the fire now. And, how he had a nice big fish. And, how he had a lovely walking stick. And, even the fact that he was not hungry. When he got home, he built a fire with the wood from the tree that he cracked. He roasted the fish that had run into his lovely stick. And, he told his father about all the adventures from the day. His father smiled with warm delight. Now the boy was tired. So, he went to bed and he fell right to sleep.",
    ],
  },
  {
    id: "end",
    paras: [],
    pull: "When he woke up the next day. There was no sword.",
  },
  {
    id: "ok",
    paras: [],
    pull: "And that was ok.",
  },
];

export const satchel = [
  { id: "sword", label: "the magic sword" },
  { id: "egg", label: "an egg he fried" },
  { id: "stick", label: "a lovely stick" },
  { id: "fish", label: "a nice big fish" },
  { id: "wood", label: "wood for the fire" },
  { id: "fire", label: "a fire, and his father" },
];
