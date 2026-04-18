# Generation QA Report

Generated at: 2026-04-18T03:24:15.942Z

## Scenario

Scenario: `creative-writing` fixture set from [scripts/fixtures/qa/creative-writing](/Users/kingtom91/Documents/Projects/Paideia/scripts/fixtures/qa/creative-writing).
Assignment corpus: `assignment.txt` + `rubric.txt` from the fixture directory.
Student corpus: 4 college-standard sample essays from the fixture directory.
Target word count: 1200.

## Level 1 Scores

Heuristic AI resistance: 7/10
Heuristic authenticity: 8/10
Judge AI resistance: 5/10
Judge sample accuracy: 3/10
Judge rubric accuracy: 4/10
Judge evidence handling: 7/10
Judge overall writing: 6/10

Verdict: The essay fails to meet the word count requirement (875 words instead of 1100-1400) and relies entirely on plagiarizing exact phrases and structures from the provided student samples rather than generating an original narrative in the same voice.

Strengths: Contains concrete sensory details and clear scene construction.; Maintains a consistent tone of reflection mixed with nostalgia.
Weaknesses: Fails the minimum word count requirement by over 200 words.; Directly copies the opening line of Sample 1 ('The bell above the laundromat door had two moods.').; Heavily recycles sentence templates from the samples (e.g., 'What I wanted then was... What I got instead was...', 'Not a lesson. Not a speech.').; Feels like a Frankenstein mashup of the student's previous works rather than a new essay.
Priority fixes: Expand the narrative to meet the 1100-1400 word requirement by developing longer scenes rather than summarizing.; Remove directly copied sentences and phrases from the reference samples.; Apply the student's syntactic patterns to completely fresh subject matter and imagery.

Metrics:
```json
{
  "wordCount": 875,
  "paragraphCount": 9,
  "sentenceCount": 91,
  "avgSentenceLength": 9.62,
  "sentenceStdDev": 7.03,
  "contractionCount": 0,
  "emDashCount": 6,
  "theOpenerPct": 16.7,
  "maxRepeatedOpenerRun": 3,
  "aiPhraseHits": [],
  "favoriteTransitionHits": [
    "But",
    "Instead",
    "One evening",
    "Then",
    "When",
    "Even",
    "The week before",
    "So",
    "At one point",
    "If",
    "During breaks",
    "Sometimes",
    "But even more than that"
  ],
  "forbiddenTransitionHits": [],
  "signatureWordHits": [
    "sound",
    "room",
    "machine",
    "wait",
    "maybe",
    "empty",
    "little",
    "almost",
    "always",
    "something",
    "never",
    "small",
    "remember"
  ],
  "avoidedWordHits": []
}
```

## Level 2 Scores

Heuristic AI resistance: 10/10
Heuristic authenticity: 10/10
Judge AI resistance: 4/10
Judge sample accuracy: 4/10
Judge rubric accuracy: 9/10
Judge evidence handling: 8/10
Judge overall writing: 6/10

Verdict: The essay captures the assignment perfectly but overfits disastrously to the provided student samples. Instead of matching the 'voice' and writing style of the author, the AI essentially played Mad Libs with the provided text. It copied exact sentence structures and conceptual beats (e.g., 'Pliers were impatient. Hammers were stubborn' directly lifting from 'Shoes could be stubborn. Towels could be lazy'; or the staccato three-fragment ending mimicking Sample 2 perfectly). This makes the essay read like an AI template rather than an authentic new piece by the same student.

Strengths: Meets length requirements and the prompt's focus on a single object/routine; Excellent sensory detail (brass dust like heavy gold pollen); Strong pacing and scene construction
Weaknesses: Blatant structural plagiarism from the provided samples; Over-relies on the exact syntactic templates of the few-shot examples rather than generating a new narrative arc; The ending feels entirely manufactured because it copies the exact rhythmic cadence of the sample essays
Priority fixes: Prompt the AI to write a completely original narrative arc that does not rely on the paragraph-by-paragraph structure of the samples; Ban the use of the specific rhetorical devices found in the samples (e.g., listing three objects with attitudes, ending with three noun fragments); Focus the prompt on extracting the *tone* (nostalgic, observant, grounded) rather than the *plot mechanics* of the samples

Metrics:
```json
{
  "wordCount": 1271,
  "paragraphCount": 16,
  "sentenceCount": 85,
  "avgSentenceLength": 14.95,
  "sentenceStdDev": 9.53,
  "contractionCount": 6,
  "emDashCount": 0,
  "theOpenerPct": 10.6,
  "maxRepeatedOpenerRun": 3,
  "aiPhraseHits": [],
  "favoriteTransitionHits": [
    "But",
    "One evening",
    "Then",
    "When",
    "Even",
    "So",
    "If",
    "Mostly",
    "Sometimes",
    "What I remember most",
    "Because of course"
  ],
  "forbiddenTransitionHits": [],
  "signatureWordHits": [
    "sound",
    "room",
    "machine",
    "wait",
    "maybe",
    "empty",
    "little",
    "always",
    "something",
    "never",
    "exactly",
    "small",
    "remember",
    "version"
  ],
  "avoidedWordHits": []
}
```

## Level 2 + Sources Scores

Heuristic AI resistance: 10/10
Heuristic authenticity: 9/10
Judge AI resistance: 8/10
Judge sample accuracy: 5/10
Judge rubric accuracy: 2/10
Judge evidence handling: 5/10
Judge overall writing: 4/10

Verdict: The essay completely fails the length requirement, coming in at 376 words when the prompt mandates 1100 to 1400. Furthermore, rather than adapting the student's voice, it blatantly lifts exact phrases and sentences from the provided samples ('By six in the morning', 'What I remember most', 'Because of course that was the point', 'I am old enough now to understand'). It feels like a Frankenstein compilation of the samples rather than an original narrative.

Strengths: Captures the focus on sensory details, sounds, and objects present in the student samples.; Maintains a grounded, working-class aesthetic consistent with the samples.
Weaknesses: Fails the word count constraint by a massive margin (376 words instead of 1100-1400).; Plagiarizes exact sentences and structural beats from the reference samples rather than generating original thoughts in the same voice.; Rushes the narrative arc, summarizing the ending abruptly rather than letting it breathe.
Priority fixes: Expand the essay significantly to meet the 1100-1400 word requirement by adding more scenes, dialogue, and pacing.; Remove directly copied phrases from the student samples ('I am old enough now to understand', 'Because of course that was the point') and generate original reflections.; Develop the relationship with Marcus or the diner environment into full scenes rather than brief summaries.

Metrics:
```json
{
  "wordCount": 376,
  "paragraphCount": 5,
  "sentenceCount": 36,
  "avgSentenceLength": 10.44,
  "sentenceStdDev": 7.46,
  "contractionCount": 5,
  "emDashCount": 0,
  "theOpenerPct": 13.9,
  "maxRepeatedOpenerRun": 1,
  "aiPhraseHits": [],
  "favoriteTransitionHits": [
    "But",
    "Instead",
    "One evening",
    "When",
    "Even",
    "So",
    "If",
    "Mostly",
    "Sometimes",
    "By six in the morning",
    "What I remember most",
    "Because of course"
  ],
  "forbiddenTransitionHits": [],
  "signatureWordHits": [
    "sound",
    "room",
    "machine",
    "wait",
    "empty",
    "always",
    "something",
    "never",
    "exactly",
    "remember"
  ],
  "avoidedWordHits": []
}
```

## Level 1 Essay

```
The bell above the laundromat door had two moods. It could sound bright and hopeful on a Tuesday afternoon when the place was empty except for the hum of machines. Or it could sound tired and thin on a Sunday night when the room was crowded with people waiting for their clothes to dry. My mother and I were Sunday night people. The floor was always wet in spots, and the air smelled like warm cotton and something else—maybe bleach, maybe loneliness. We went every week, sometimes twice if somebody got sick or spilled something. It was never something you planned for. It was just something that happened, like rain.

My mother’s machine was number seven. She said it had a kind heart. “Some machines shake too hard,” she told me once, her voice low under the noise. “Number seven is gentle.” I used to think she was making that up, but now I’m not so sure. I remember the hollow glug of the soap dispenser, the way she’d count out quarters from a small plastic bag, her fingers quick and certain. She never looked at the other people waiting. She looked at the clothes spinning behind the glass, like she was watching something holy.

One evening, a woman two machines over started crying. Not loud. Just a soft, tired sound. My mother didn’t turn. She kept folding a towel into a neat square, then a smaller one. When the woman’s dryer buzzed, my mother walked over and started pulling out the warm clothes. “Here,” she said, her voice almost lost in the hum. “Let me.” The woman didn’t say anything. She just nodded and wiped her face with the back of her hand. They folded together in silence, and when they were done, the woman looked at my mother and said, “Thank you.” Two words. Nothing else. My mother smiled a little. “It’s just laundry,” she said.

But even more than that, I remember the waiting. Waiting for the spin cycle to finish. Waiting for the last sock to dry. Waiting for my mother to look up from her book and say it was time to go. The chairs were hard plastic, the kind that made your back hurt if you sat too long. I used to count the tiles on the floor—thirty-six—or trace the cracks in the ceiling. Sometimes I’d watch the other families, the kids running between the rows of machines, the parents looking tired in a way that seemed permanent. My mother never rushed. She said waiting was part of the work. “You can’t hurry clean,” she told me. “Things take the time they take.”

During breaks in the cycle, she’d tell me stories. Not big ones. Small ones. About the dress she wore to her sister’s wedding. About the time my father tried to wash a red sock with his white shirts. About the way her own mother used to hang clothes on a line in the backyard, even in winter. “The cold made them smell like sky,” she said. I loved those stories. They felt like something solid in a room full of noise and wet floors.

The week before I left for college, we went one last time. It was a Tuesday. The place was quiet. Only one other machine was running. My mother put our clothes in number seven, the gentle one, and when the cycle started, she sat next to me and didn’t open her book. “You’ll have to do this yourself now,” she said. It wasn’t an accusation. It was just a fact. I nodded. I didn’t know what to say. The machine hummed. The bell above the door stayed quiet.

At one point, she reached into her bag and pulled out a small, folded square. A handkerchief. White with a blue border. “Your grandmother gave this to me,” she said. “I never use it. But I thought you might want it.” I took it. The fabric was soft, almost worn through in one corner. When I unfolded it, I saw her initials stitched in blue thread. Small. Careful. “She said a clean handkerchief is a small kindness,” my mother said. “For yourself or someone else.”

I am old enough now to know that not everything gets clean. Some stains stay. Some memories fade. But I still think about that laundromat. The wet floor. The hum of number seven. The way my mother folded that stranger’s clothes without asking why. What I wanted then was to be somewhere else—anywhere else. What I got instead was a room full of waiting, and a woman who believed that even the smallest things—a towel, a sock, a handkerchief—could hold a kind of dignity if you treated them right.

Sometimes, in my own apartment, when I’m waiting for the dryer to finish, I unfold that handkerchief. The blue thread is a little faded now. The fabric is thin. But it still smells like clean. Like something that was cared for. Like waiting. And I remember my mother’s voice under the noise, telling me that some machines are gentle, and some stains don’t matter, and some things are worth the time they take. Not a lesson. Not a speech. Just laundry. Just waiting. Just the quiet hum of something clean.
```

## Level 2 Essay

```
The key-cutting machine in the back of the hardware store always woke up sounding like it was trying to chew through a handful of gravel. It never liked the mornings. My grandfather would flip the toggle switch with his thick thumb, and the motor would whine for maybe ten seconds before the spinning blade finally found its rhythm. A stutter. A spark. A brief metallic cough. I spent my afternoons and Saturday mornings sitting on a flipped-over joint-compound bucket by the register, waiting for customers to bring in blank keys so I could watch the little machine work.

Most of the time, the store smelled like potting soil and damp wood, but the space behind the counter smelled exactly like hot oil. It was a narrow aisle built out of pegboard and glass cases, crowded with boxes of steel screws that rattled when you walked past. The floorboards there sagged in the exact shape of my grandfather's boots. He had owned the store since my dad was in middle school, and by the time I started sitting on that bucket, he moved through the aisles like a man navigating his own living room in the dark. He knew exactly which hinges squeaked. He knew that the third fluorescent light from the door would buzz for twenty minutes before deciding to be quiet.

To be eight years old in a hardware store is to be surrounded by things you are not allowed to touch. Chisels. Handsaws. Tins of chemical solvent that looked suspiciously like juice cans. My grandfather kept me busy by giving me tasks that required sorting, mostly just to keep my hands out of the display cases. I was in charge of the metal washers, separating the flat ones from the split-ring lock washers that looked like they had been bent and broken on purpose.

"Don't rush it," he told me one Saturday when I dumped a whole handful into the wrong plastic drawer, making a mess of the quarter-inch sorting bin. "A lazy hand makes a sloppy room."

That was how he talked. Half dad, half cryptic mechanic. I didn't know what a sloppy room had to do with zinc washers, but I understood the tone. He believed that everything in the store had a specific geometry, an attitude, a way it preferred to be held. Pliers were impatient. Hammers were stubborn but honest. Tiny screws just wanted to disappear into the cracks of the floorboards. And the key machine, a heavy green block of cast iron bolted to a workbench scarred with burn marks, was the most dramatic of them all.

Sometimes, the store was completely empty, and the air got heavy and quiet, settling over the aisles like dust on a bookshelf. One evening, right before closing, the bell over the door chimed and a guy in a stained work shirt came in wanting two copies for his truck. He seemed agitated, checking his watch and tapping his knuckles against his thigh. He slapped the original key down on the glass counter next to the register. It was a Ford key, worn smooth at the edges, looking like it had spent ten years rubbing against coins in a dark pocket.

My grandfather picked it up by the plastic head. He never rushed this part, no matter how much the customer sighed. He walked over to the heavy green machine, clamping the old key into the left side of the vise and twisting the knob until the metal gave a tight, satisfied pinch. Then he slowly selected two blanks from the spinning metal rack above the workbench, their edges perfectly smooth and useless.

When I asked him why he always wiped the blade down with a greasy blue shop rag before starting the motor, he just tapped the side of the machine with his knuckle.

"Metal only listens to you if you show it you have time," he said.

Then he hit the switch. The motor jumped into a high, anxious whistle. He guided the carriage by hand, pushing the heavy lever sideways so the blank key pressed against the spinning cutting wheel while brass shavings spit onto his apron. The noise was loud enough to vibrate in my back teeth. It sounded like something was tearing. Like the machine was eating itself alive just to carve out a tiny geography of hills and valleys.

But he never wore earplugs. He leaned in close, his glasses reflecting the sparks, his eyes narrowed against the flying debris until the little metal needle traced the exact jagged profile of the original key. He moved his hands with a slow, heavy grace, applying just enough pressure. Too much, and the cut would be too deep, ruining the blank. Too little, and the new key would act arrogant, refusing to turn in the ignition. Brass dust covered his hands like heavy gold pollen. The floor around his boots glittered with it.

When the whining finally stopped, he unfastened the heavy metal clamps. He ran the fresh keys over a spinning wire brush on the side of the machine to take off the sharp burrs. The brush hummed a low, steady note, softer than the cutting wheel, like the machine was apologizing for the tantrum. He wiped the new keys on his apron, checking them against the original. A glance. A thumb rubbing the fresh edge. A satisfied nod.

He handed them over to the man, walking back to the front register to ring up the sale. The register was an antique that clacked like a set of heavy wooden teeth. He pressed the mechanical buttons, and the drawer shot open with a bright ring. A dime. Two quarters. Three pennies. I always wanted him to hurry up during this part, shifting my weight on the flipped-over bucket because I was young and impatient, eager to lock the glass door and go home for dinner. The customer shifted his weight, too, holding out a hand that expected the change to be dumped into it in one swift motion. But my grandfather counted out the change slowly. He took his time to make sure every single coin landed perfectly flat in the customer's open palm.

What I remember most is the absolute quiet that followed when the door swung shut and the lock clicked into place. Because of course, the store always felt smaller when the machine was finally turned off, returning to its heavy iron silence.

I am old enough now to understand that he wasn't just stalling or dragging his feet when he counted those coins, just like he wasn't being dramatic when he wiped down the blade. He was making sure the exact version of the world he was copying actually fit. In a hardware store, people only come to you when something is broken, lost, or needs to be duplicated. They bring you their small emergencies and their inconveniences. My grandfather met that impatience with a stubborn, deliberate pacing.

I still think about that sound. The harsh grind of the wheel cutting into a fresh blank, and the quiet precision that came right after. I think about the way his thumb rubbed the jagged edge to test the bite of the brass. Now, when I am rushing through my own routines, feeling the familiar hum of anxiety that wants me to move faster, I try to remember the weight of that cast-iron machine. Sometimes, a copy isn't just a piece of metal. It's a small promise that a door will actually open when you ask it to. A slow hand. A clean cut. A shape that remembers where it belongs.
```

## Level 2 + Sources Essay

```
The Hobart dishwasher in the back of the diner always woke up angry. When I pulled the heavy handle down to lock the tray, the machine swallowed the plates with a sudden, wet cough. Mostly, the late shift was exactly this kind of empty room. Steam leaked from the peeling rubber gaskets, filling the air with the permanent smell of bleach and old grease. The whole corner felt like it had forgotten how to breathe. Waiting. Just waiting for something to happen. 

One evening, the plastic bus tubs were overflowing with thick ceramic plates. I was scraping cold eggs into the trash can as fast as my hands could possibly move. Sink. Trash. Rack. Marcus stood at the prep table right behind me. He was slicing tomatoes with a quiet, steady rhythm that made his knife sound exactly like a ticking clock. I slammed the loaded dish rack onto the rails because I wanted to clear some space. Instead of waiting for the latch to catch naturally, I threw my entire body weight onto the handle to force it shut. The metal squealed before the hot water finally kicked in. 

"You fight the metal, you lose to the metal," Marcus said. 

He didn't look up from his cutting board. So I just stood there in my wet boots, listening to the water hit the porcelain inside the dark machine. What I remember most is the way he just kept slicing. Because of course that was the point. The machine was always going to be heavier than me, and the water was never going to speed up a wash cycle just because we were busy. I wanted to force the room to move at my panicked speed. But the diner didn't care. It wasn't a punishment. Just a cycle.

By six in the morning, the kitchen felt like a massive machine we were all trying to drive at the exact same time without crashing. The fry cooks tapped their spatulas against the hot grill. Plates. Cups. Silverware. Ice. Sometimes, I still think about that squealing handle. I am old enough now to understand that you can't rush a cycle just because your hands hurt. You have to let the machine do exactly what it's built to do.
```
