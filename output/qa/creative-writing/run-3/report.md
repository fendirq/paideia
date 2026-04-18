# Generation QA Report

Generated at: 2026-04-18T03:39:38.166Z

## Scenario

Scenario: `creative-writing` fixture set from [scripts/fixtures/qa/creative-writing](/Users/kingtom91/Documents/Projects/Paideia/scripts/fixtures/qa/creative-writing).
Assignment corpus: `assignment.txt` + `rubric.txt` from the fixture directory.
Student corpus: 4 college-standard sample essays from the fixture directory.
Target word count: 1200.

## Level 1 Scores

Heuristic AI resistance: 8/10
Heuristic authenticity: 8/10
Judge AI resistance: 7/10
Judge sample accuracy: 6/10
Judge rubric accuracy: 4/10
Judge evidence handling: 8/10
Judge overall writing: 7/10

Verdict: The essay captures the quiet, observant tone of the samples but relies too heavily on direct structural mimicry (essentially mad-libbing the provided texts). Most critically, at 801 words, it completely misses the required 1100-1400 word count.

Strengths: Excellent use of sensory detail (smell of yeast and warm flour, hiss of a grill).; Successfully matches the quiet, reflective, object-oriented narrative style of the real student.; Good balance of scene and summary.
Weaknesses: Fails the length constraint by over 300 words.; Over-relies on exact sentence structures from the samples (e.g., 'What I wanted from... What I got instead was...', 'For him, it was smaller and quieter than that...').; Pacing feels rushed because the word count is so low.
Priority fixes: Expand the narrative to meet the 1100-1400 word requirement by adding more distinct scenes rather than summarizing the middle of the route.; Break away from the exact syntactical templates of the samples to create an authentic original rhythm.; Deepen the reflection in the final paragraphs to avoid repeating the 'small/quiet/steadied' motif quite so overtly.

Metrics:
```json
{
  "wordCount": 801,
  "paragraphCount": 18,
  "sentenceCount": 71,
  "avgSentenceLength": 11.28,
  "sentenceStdDev": 6.6,
  "contractionCount": 0,
  "emDashCount": 1,
  "theOpenerPct": 22.2,
  "maxRepeatedOpenerRun": 3,
  "aiPhraseHits": [],
  "favoriteTransitionHits": [
    "Instead",
    "But",
    "Then",
    "When",
    "The week before",
    "So",
    "Now",
    "At one point",
    "After",
    "By six in the morning"
  ],
  "forbiddenTransitionHits": [],
  "signatureWordHits": [
    "sound",
    "machine",
    "steady",
    "small",
    "felt",
    "empty",
    "always",
    "almost",
    "version"
  ],
  "avoidedWordHits": []
}
```

## Level 2 Scores

Heuristic AI resistance: 10/10
Heuristic authenticity: 10/10
Judge AI resistance: 7/10
Judge sample accuracy: 6/10
Judge rubric accuracy: 9/10
Judge evidence handling: 8/10
Judge overall writing: 7/10

Verdict: The essay captures the sensory details and fragmented syntax of the student samples, but it does so through blatant structural cloning. It feels like a 'Mad Libs' version of the original essays, swapping in a sander and a desk for a sewing machine and a thermos, right down to directly copying specific phrasing ('Drawers have attitudes' mimicking 'Objects... had attitudes').

Strengths: Excellent use of concrete sensory detail (smell of old tape, dull rattle, burnt sugar).; Successfully meets the rubric's length and structural requirements for a narrative centered on an object.; Maintains a consistent, nostalgic tone appropriate for the genre.
Weaknesses: Overly formulaic mimicry; directly copies unique phrasing and paragraph structures from the samples.; The use of trailing fragments at the end of paragraphs ('A strike. A bell. A turn.') is overused and feels highly mechanical.; The thematic reflection relies too heavily on identical beats from the sample texts rather than discovering its own organic meaning.
Priority fixes: Remove direct structural clones of the sample sentences (e.g., 'Drawers have attitudes').; Vary the paragraph endings instead of relying on the 'Fragment. Fragment. Fragment.' formula every time.; Allow the narrative arc to diverge slightly from the 'repairing an object to connect with a relative' template so it feels like a fresh story rather than a template swap.

Metrics:
```json
{
  "wordCount": 1207,
  "paragraphCount": 12,
  "sentenceCount": 102,
  "avgSentenceLength": 11.83,
  "sentenceStdDev": 7.21,
  "contractionCount": 8,
  "emDashCount": 0,
  "theOpenerPct": 18.6,
  "maxRepeatedOpenerRun": 3,
  "aiPhraseHits": [],
  "favoriteTransitionHits": [
    "By late afternoon",
    "Instead",
    "But",
    "Then",
    "When",
    "So",
    "Now",
    "After",
    "Because of course",
    "Some mornings"
  ],
  "forbiddenTransitionHits": [],
  "signatureWordHits": [
    "sound",
    "machine",
    "room",
    "strange",
    "steady",
    "tape",
    "line",
    "small",
    "felt",
    "maybe",
    "quietly",
    "empty",
    "always",
    "almost",
    "version"
  ],
  "avoidedWordHits": []
}
```

## Level 2 + Sources Scores

Heuristic AI resistance: 8/10
Heuristic authenticity: 10/10
Judge AI resistance: 6/10
Judge sample accuracy: 5/10
Judge rubric accuracy: 9/10
Judge evidence handling: 8/10
Judge overall writing: 6/10

Verdict: The essay hits the prompt requirements and adopts the thematic focus of the student samples beautifully. However, it overcorrects on mimicking the student's concise style, resulting in a hyper-staccato, robotic rhythm with an average sentence length of just 9 words. It also awkwardly lifts exact transitions and phrases from the provided samples rather than writing originally in that voice.

Strengths: Excellent use of concrete, vivid sensory details (e.g., green oxidation, the smell of parts cleaner, the sharp snap of the metal).; Successfully builds a strong narrative arc focusing on a single, meaningful task and object.; Follows the rubric's instruction to let meaning unfold naturally before reflecting on it at the end.
Weaknesses: The sentence rhythm is monotonously choppy, with long runs of subject-verb simple sentences ('I strained my shoulders. I locked my elbows. I threw my entire body weight...').; It plagiarizes the student samples' exact transitions and phrasing ('that's the only way I can describe it', 'By six in the morning', 'Because of course').; The pacing feels unnatural because the sentence length rarely varies to match the emotional beats of the story.
Priority fixes: Vary sentence structure and length by combining shorter, choppy sentences using conjunctions and dependent clauses.; Remove verbatim phrases lifted from the provided student samples and replace them with original transitions.; Smooth out the repetitive pronoun openers (I, He, The) to create a more fluid narrative voice.

Metrics:
```json
{
  "wordCount": 1354,
  "paragraphCount": 8,
  "sentenceCount": 145,
  "avgSentenceLength": 9.34,
  "sentenceStdDev": 4.69,
  "contractionCount": 10,
  "emDashCount": 0,
  "theOpenerPct": 24.1,
  "maxRepeatedOpenerRun": 5,
  "aiPhraseHits": [],
  "favoriteTransitionHits": [
    "By late afternoon",
    "Instead",
    "But",
    "One evening",
    "Then",
    "When",
    "So",
    "Now",
    "At one point",
    "One night",
    "After",
    "By six in the morning",
    "Because of course",
    "Some mornings"
  ],
  "forbiddenTransitionHits": [],
  "signatureWordHits": [
    "sound",
    "machine",
    "room",
    "strange",
    "steady",
    "tape",
    "line",
    "small",
    "felt",
    "maybe",
    "quietly",
    "empty",
    "always",
    "almost",
    "version"
  ],
  "avoidedWordHits": []
}
```

## Level 1 Essay

```
The truck had a kind of sigh when the engine shut off. Not a groan, not a rattle. Just a long, tired breath that seemed to come from deep inside the metal. By six in the morning, the street was still dark, and the only sound besides that sigh was the tap of the driver’s door opening and closing. My father would come in through the side door, his boots heavy on the linoleum, and the house would shift around his arrival.

The week before my senior year started, he asked if I wanted to ride along on his route. He delivered bread for a local bakery, a job he had done since I was small. I said yes because I didn’t have anything else to do, and because I wanted to see what his mornings looked like. He always came home quiet, like he had been somewhere the rest of us couldn’t follow.

“You’ll need to be quiet,” he said. “No radio. No talking unless I say so.”

We left at three thirty. The truck smelled like yeast and warm flour, a scent so thick you could almost taste it. The cab was small, the seats worn thin in places where his body had pressed day after day. He drove with one hand on the wheel, the other resting on the gearshift, and he didn’t say a word. Outside, the streetlights cast long blue shadows that made the world feel empty and new.

Our first stop was a diner on the edge of town. The back door was unlocked, and my father carried in three racks of sourdough without making a sound. The kitchen was already awake—the hiss of a grill, the clatter of pans, a man humming softly to himself. My father set the bread on a metal shelf, nodded once, and walked back out. No paperwork. No small talk. Just the bread, and the nod, and the door closing behind us.

Back in the truck, he finally spoke. “Some people like conversation. Some just want the bread.”

That was the kind of thing he said. Simple, almost obvious, but it stuck. He wasn’t judging either way. He was just telling me how the machine worked.

We drove for hours. Grocery stores, coffee shops, a school cafeteria. Each stop was the same: park, unload, nod, leave. The rhythm was steady, almost hypnotic. The truck would sigh when he turned it off, then sigh again when he turned it back on. The bread racks rolled in and out on wheels that had been oiled so many times they didn’t make a sound.

At one point, we pulled over near the edge of the city to watch the sun come up. The sky turned from black to gray to a soft orange that made the truck’s windshield glow. My father handed me a small loaf wrapped in wax paper. “Burnt one,” he said. “They always give me the burnt ones.”

It was warm, the crust a little too dark, the inside soft and dense. We ate without talking, watching the light spread over the roofs of houses where people were still asleep.

“You ever get bored?” I asked.

He thought for a minute. “Used to. Then I started noticing things.”

“Like what?”

“The way the baker leaves the radio on for the bread. The cat that waits for me behind the grocery store. The sound the truck makes when it’s cold.” He shrugged. “Small stuff. But it keeps the machine honest.”

When I was younger, I thought his job was just about bread. A simple, steady thing. Now I think it was more like a conversation he was having with the world, one stop at a time. Not with words, but with presence. With showing up.

We finished the route by nine. The sun was high, the streets loud with traffic. Back home, my mother was making coffee. My father hung his keys on the hook by the door, the way he always did, and the house settled back into its daytime rhythm.

I never rode with him again. But sometimes, on mornings when I can’t sleep, I think about that truck sighing in the dark. I think about the burnt loaf of bread, warm in my hands. My father never talked about purpose or meaning. For him, it was smaller and quieter than that. A nod. A cat. The sound of an engine turning off, then on again. A machine that knew its own rhythm and kept to it, day after day, without complaint.

What I wanted from that morning was to understand his silence. What I got instead was a version of care that didn’t need words to be felt. Just bread. Just showing up. Just the steady sound of a machine doing what it was built to do.
```

## Level 2 Essay

```
The orbital sander starts with a dull rattle. that's the only noise it knows. I press the trigger, the motor hesitates for a second, and then the whole machine settles into a steady, vibrating hum that climbs up my forearms. I bought the heaviest grit they had at the hardware store. The paper feels like asphalt against my thumb. I need it because the old varnish is thick, almost burnt in places, and it fights back against the machine. Varnish has a memory. It wants to stay exactly where it's. The chemical stripper I poured an hour ago sits in puddles along the grain. It smells quietly poisonous, like ammonia and old tape. I wipe the excess away with a shop towel, but the wood stays dark. Just grit. Just noise. A vibration traveling up the elbow.

I dragged the desk into the garage three days ago. It took two people to lift the main body, and even then, the back legs scraped against the concrete. Before sanding, I had to remove the drawers. Drawers have attitudes. They can be stubborn. The top right one refused to let go of its tracks, locking up halfway like it was offended by the intrusion. I had to pull it from side to side, listening to the dry scrape of wood on wood. Inside, the drawer smelled like graphite and stale paper. I found a single rusted paperclip in the back corner. The handles were tarnished brass, shaped like small cups that caught the dust. They came off easily enough, leaving darker patches of wood underneath where the air and the light had not reached in decades. Bare hardware. Empty tracks. 

By late afternoon, my hands ache from the steady pressure of holding the block flat. I am trying to level out the strange water rings blooming across the wood near the right corner. It takes ten minutes just to cut through the top layer of grime to reach the paler oak hiding underneath. The friction creates a smell like burnt sugar. The machine kicks back when it hits a knot in the wood, a sudden jolt that makes me reset my stance. I used to think restoration meant making something entirely new. I thought it was about scraping away the past until you reached a blank version of the object, stripping it down until it had no memory left. Maybe I was wrong. Heat beneath my palms. Wood dust. The dull ache in a wrist.

When my grandfather was alive, this desk sat in the small back room of his house, pushed tight against a window that looked out on the driveway. The room wasn't an office. It was just a space that collected things. The room smelled like stale tobacco, newspaper print, and the heat coming off the metal radiator. Some mornings, I sat on the carpet listening to the clatter of his typewriter keys striking the ribbon. The typewriter was a heavy machine that sounded like a fist hitting a table. It seemed to keep time for the empty house. Every sentence ended with the sharp ring of the carriage return, then the ratcheting sound of the roller feeding the paper up one line. A strike. A bell. A turn.

He always drank black coffee. He made it in a percolator on the stove, bringing it into the back room in a ceramic mug that had chipped along the rim. He never used a coaster. Coasters, in his house, belonged in the living room where guests sat, not in the room with the typewriter. He would set the mug right on the bare wood while he shuffled through papers, leaving wet circles that dried into the grain. Once, my grandmother came in with a catalog and slid it under his cup.

"You're going to ruin the finish," she said.

He lifted the cup, slid the catalog back to her, and put the cup down in the exact same spot. "Wood's meant to be used," he said, not looking up from the page. "Otherwise it's just a museum."

This was his philosophy on everything. Objects existed to do a job. Shoes were meant to be scuffed. Tools were meant to be covered in grease. A desk that looked too clean was a desk where no actual work happened. He talked in statements like that, dropping lines that felt final and absolute. I watched him type a letter to the city gas company. He used exactly two fingers, hitting the keys with the force of someone driving a nail. When he made a mistake, he didn't use correction fluid. He just typed over the wrong letter until it became a dense, black square of ink.

Mostly I liked to watch him work. I liked observing the steady line of his shoulders and the way he treated his space like it had its own loyalties. The desk held his tax returns, his spare spark plugs, a radio with a bent antenna, and stacks of envelopes he never threw away. Everything had a place, even if the place looked like a mess to anyone else. I remember the sound of him pulling open the center drawer. It had a hollow wooden scrape, a sound that meant he was looking for a pen. He would dig through the loose change and rubber bands, find what he needed, and slam the drawer shut with his hip. A scrape. A thud.

Years later, when we cleared out the house, the desk was the only thing I asked for. We spent three weekends filling black garbage bags with things that used to matter. I carried out boxes of old receipts, bent nails in coffee cans, and instruction manuals for appliances he hadn't owned in twenty years. The men from the donation center took the couch and the dining chairs, but I put a hand on the oak top and said I was taking it. It sat in my apartment for a year, acting as a table for mail I didn't want to open. The wood felt dull. The water rings looked like mistakes instead of history. that's why I bought the sander. I wanted to clean it up, to make it look like a piece of furniture again instead of a remnant.

Now, I switch the machine off. The motor spins down, dropping from a hum to a slow clicking noise before stopping completely. My ears ring in the sudden silence of the garage. I wipe the sawdust away with a rag. The wood is pale now, stripped of the dark varnish and the grime of the back room. But near the hinge, a darker circle remains.

I trace the ghost of the ring. It almost disappeared under the sandpaper. If I switch the machine back on and hold it there for another five minutes, I could erase it completely. I could make the wood blank. But because of course, I don't want it perfectly clean. The ring is a record of a ceramic mug, a typewriter, a morning in a house that no longer exists. I run the rag over it one last time, making the surface just smooth enough to hold something new. The room goes quiet. A fine powder. Settling over everything.
```

## Level 2 + Sources Essay

```
The fluorescent light in the garage hummed a steady, strange note. that's the only way I can describe it. One evening, I stood in the back of the garage under that light. It cast long shadows over the workbench, the cracked floor, and the aluminum shell of the 1974 Evinrude outboard motor. The machine was a heavy block of dead metal. It seemed to hold its breath. Like it was keeping the room hostage to the smell of stale gasoline, damp dust, and old two-stroke oil. By late afternoon, my grandfather and I had dragged it from the dirt floor of his shed. The engine had fought us the whole way. The lower unit caught on the doorframe like it was trying to anchor itself to the dirt. We finally hauled it up onto a reinforced wooden stand where it sat dripping black grease onto an empty cardboard box. Not a leak. More like a stubborn bleed. The motor felt arrogant. It had sat under a tarp for two decades and did not want to be disturbed. "We take it slow," he said, handing me a small shop rag that felt stiff with dried grime. I wanted to be useful. Mostly I just waited. 

By six in the morning, the garage was always freezing. The cold steel tools seemed to resent being woken up. The heavy wrenches bit into my bare hands as I scrubbed the carburetor bowl with a wire brush. Flakes of green oxidation. Hardened fuel deposits. Grit stuck there since before I was born. The small metal bowl felt fragile under the pressure. Like an eggshell made of brass. He watched my hands carefully. He leaned against the plywood table, wrapping black tape around a frayed ignition wire. I realized he wasn't worried about the engine parts breaking. Instead, he was trying to teach me a quiet kind of rhythm. A version of patience I didn't yet understand. I wanted to rush the job. I wanted the engine to roar to life and prove my weekend wasn't wasted. "Don't force the brass," he said quietly. The silence stretched out. The space heater in the corner kicked on with a tired metallic rattle. The garage felt like a submarine sitting at the bottom of the ocean. Just us and the cold metal. 

At one point, I grabbed a heavy socket wrench to loosen the main flywheel nut. The bolt was welded in place by time and salt water. It refused to turn. I strained my shoulders. I locked my elbows. I threw my entire body weight into the steel handle. The socket slipped. My knuckles crashed into the sharp corner of the engine block. Blood welled up in a thin, bright line across my skin. It stung fiercely in the cold air. The wrench clattered to the cement floor with a hollow ring. It sounded almost exactly like a laugh. "Let the tool do the heavy lifting," he said quietly. He picked the wrench up. He placed it back into my shaking hand. He did not look at my bleeding knuckles. He expected the work to hurt sometimes. Maybe because a stubborn machine demands a toll before it decides to give up its rust. A little bit of skin left behind on a sharp gear. I cursed under my breath. That was his only sympathy. We went back to work. 

After that first weekend, the routine settled into our bones. The garage became a closed universe. Metallic clinking. The steady scrape of sandpaper on aluminum. The harsh chemical smell of parts cleaner evaporating in the heavy air. The exhaustion that sat right behind my eyes by dinner time. The motor slowly came apart into dozens of small pieces. Spread across the long workbench, they looked like the scattered bones of a strange, mechanical animal. We were trying to resurrect it from a long sleep. Some mornings, I scrubbed spark plug threads with a hard nylon toothbrush. He sat on his tall wooden stool. He checked gaps with a tiny metal tool, squinting at the precise measurements. He nodded whenever a piece was clean enough to keep. He would wipe down the same gear with his rag for twenty minutes until it shined like a mirror. He believed the parts had memories. If you left the dirt on them, they would remember being broken. A bolt. A washer. A pin. We cleaned every single piece. It was almost a religion. The repetitive motion felt like a steady, low hum filling up the space. 

Then the actual rebuilding process began. We spent hours sliding pistons back into their tight cylinders. We aligned fragile paper gaskets so they matched exactly. We reconnected fuel lines that felt as stiff as old arteries. The rubber fought back. It didn't want to bend into new, useful shapes. But slowly, the machine began to look whole again. It rested on the wooden stand with a fresh coat of gray primer. The freshly coiled nylon pull-cord promised explosive energy waiting to be released. Almost like it had a pulse. I ran my fingers over the butterfly valve. I felt the smooth, satisfying snap of the metal springing shut against itself. I used to think fixing things was a simple transaction. Old out, new in. But I was learning it's really about putting things back into the right alignment. So they can breathe. So the metal pieces remember how to talk to each other without grinding. "Check the choke plate again," he pointed. Everything had to be exact. The engine was an audience that wouldn't accept a sloppy performance. 

One night, we finally poured a fresh mixture of gas and oil into the small red plastic tank. We hooked the rubber line up to the carburetor nipple. I primed the rubber bulb until it felt rock hard against my thumb. We stood back. The air in the garage felt heavy and expectant. It was filled with the sharp fumes of raw fuel. The damp chill crept in under the metal door, exactly the way it always did after the sun went down. "Give it a short tug to set the piston, and then pull it straight through," he said. He crossed his arms over his flannel chest. Like he was bracing for a loud sound. I grabbed the black plastic handle. I yanked backward with everything I had. 

But the cord stopped dead halfway out. It violently jerked my shoulder forward, kicking back with a vicious metallic clank. The nylon cord snapped entirely off the handle. I stumbled backward. I fell hard against the edge of a tall metal shelving unit. The loose string whipped harmlessly back inside the motor housing. My hand went totally numb. The silence that followed was heavy and absolute. The fluorescent light kept humming its strange note. The Evinrude sat there on its wooden stand, unchanged. Still a block of dead metal. Still refusing to speak. 

Because of course, care isn't a guarantee of resurrection. Sometimes, despite the hours spent in the cold scraping away the grit of the past to find a clean surface, the machine just refuses to turn over. I thought my grandfather would be angry. I thought he would throw a wrench or curse the weeks we had wasted on a dead engine. Instead, he just picked up his rag and wiped a tiny drop of spilled gas off the painted cowling. The motion was so gentle it surprised me. I am older now, and I finally understand what he was doing in that freezing garage. The rebuilding was never about the engine running. It was about the attention we gave it. Rooms absorb the weight of the hours you spend in them. Machines hold the quiet rhythm of your hands. They learn your patience or your frustration. When I think of that winter, I don't remember the failure. The broken cord is just a detail. What I remember is the smell of parts cleaner. The scrape of the wire brush. A cold morning. A shared silence. The quiet satisfaction of knowing you stayed in the room and did the work anyway.
```
