# Generation QA Report

Generated at: 2026-04-18T02:17:04.428Z

## Scenario

Assignment corpus: Abbasid essay prompt + rubric from `output/doc/qa-level2/`.
Student corpus: 4 repo-hosted sample essays from the same folder.
Target word count: 780.

## Level 1 Scores

Heuristic AI resistance: 9/10
Heuristic authenticity: 9/10
Judge AI resistance: 9/10
Judge sample accuracy: 9/10
Judge rubric accuracy: 4/10
Judge evidence handling: 8/10
Judge overall writing: 8/10

Verdict: The generated essay perfectly captures the student's authentic voice and preferred sentence structures. However, it completely fails the assignment's word count requirement.

Strengths: Flawlessly replicates the student's clunky but effective transitions (e.g., 'This matters because', 'This shows that').; Uses the specific organizational structure requested by the prompt (causes and consequences).; Maintains a consistent, simple academic tone that matches the samples.
Weaknesses: Fails the word count requirement significantly (547 words vs. the required 700-850 words).; Some paragraphs are slightly shorter and less developed than they could be to meet the length requirement.
Priority fixes: Expand the body paragraphs with more specific historical evidence to meet the 700-850 word count constraint.; Elaborate further on the translations and intellectual shift to add natural length.

Metrics:
```json
{
  "wordCount": 547,
  "paragraphCount": 7,
  "sentenceCount": 32,
  "avgSentenceLength": 17.09,
  "sentenceStdDev": 5.39,
  "contractionCount": 0,
  "emDashCount": 0,
  "theOpenerPct": 18.8,
  "maxRepeatedOpenerRun": 1,
  "aiPhraseHits": [],
  "favoriteTransitionHits": [
    "Another reason is that",
    "In the sources",
    "In the end",
    "At the same time",
    "Another thing is that",
    "Overall",
    "Even though",
    "This matters because",
    "This shows that",
    "This shows",
    "This is important because",
    "But",
    "Also"
  ],
  "forbiddenTransitionHits": [],
  "signatureWordHits": [
    "people",
    "because",
    "also",
    "important",
    "shows",
    "matters",
    "mattered",
    "another",
    "power",
    "world",
    "different",
    "support",
    "reason",
    "rulers"
  ],
  "avoidedWordHits": []
}
```

## Level 2 Scores

Heuristic AI resistance: 9/10
Heuristic authenticity: 10/10
Judge AI resistance: 9/10
Judge sample accuracy: 9/10
Judge rubric accuracy: 10/10
Judge evidence handling: 8/10
Judge overall writing: 8/10

Verdict: The essay successfully mimics the student's voice, utilizing the exact sentence structures and repetitive analysis frames found in the writing samples. It addresses the rubric completely. However, it relies heavily on verbatim phrases lifted from the samples, making it feel slightly cloned rather than newly generated in the same style.

Strengths: Perfectly captures the student's repetitive analytical phrasing ('This matters because...', 'This shows that...').; Meets all rubric requirements, clearly separating causes and consequences with specific historical evidence.; Avoids high-level AI vocabulary entirely, sticking perfectly to the student's lexicon.
Weaknesses: Overuses exact phrases from the samples (e.g., 'a lot of people were already mad', 'pushed to the side', 'not just one family fighting another family').; Transitions are extremely repetitive ('Another reason is that', 'Another thing is that', 'Another reason is that'). While accurate to the student, 9 paragraphs of this gets tedious.
Priority fixes: Vary the borrowed phrases slightly so they sound natural to the student's vocabulary without being direct copy-pastes from the writing samples.; Condense some of the smaller paragraphs to improve flow, as 9 paragraphs for an 800-word essay makes it feel overly segmented.

Metrics:
```json
{
  "wordCount": 815,
  "paragraphCount": 9,
  "sentenceCount": 53,
  "avgSentenceLength": 15.38,
  "sentenceStdDev": 6.08,
  "contractionCount": 0,
  "emDashCount": 0,
  "theOpenerPct": 17,
  "maxRepeatedOpenerRun": 4,
  "aiPhraseHits": [],
  "favoriteTransitionHits": [
    "Another reason is that",
    "Another thing is that",
    "Overall",
    "Even though",
    "In short",
    "This matters because",
    "This shows that",
    "This shows",
    "This is important because",
    "But",
    "Also"
  ],
  "forbiddenTransitionHits": [],
  "signatureWordHits": [
    "people",
    "because",
    "also",
    "important",
    "shows",
    "matters",
    "mattered",
    "another",
    "power",
    "world",
    "different",
    "support",
    "reason",
    "rulers"
  ],
  "avoidedWordHits": []
}
```

## Level 2 + Sources Scores

Heuristic AI resistance: 10/10
Heuristic authenticity: 10/10
Judge AI resistance: 10/10
Judge sample accuracy: 10/10
Judge rubric accuracy: 10/10
Judge evidence handling: 9/10
Judge overall writing: 9/10

Verdict: Exceptional mimicry of the student's authentic voice. The essay perfectly captures the student's syntax (such as writing out contractions and relying on transition phrases like 'Another reason is that') and vocabulary level ('mad', 'smart'). It seamlessly meets all rubric constraints while remaining entirely in character.

Strengths: Flawless replication of the student's distinct analytical voice and sentence structure.; Excellent integration of specific historical evidence (mawali, Khorasan, Battle of the Zab, Baghdad) explained in the student's natural terms.; Meets the word count and directly addresses both causes and consequences as requested by the prompt.
Weaknesses: Slightly repetitive use of the prompt's phrase 'reshaped the Islamic world', though this is a common and authentic student habit.
Priority fixes: None. This is an excellent, highly authentic-sounding student essay that fulfills all criteria.

Metrics:
```json
{
  "wordCount": 777,
  "paragraphCount": 6,
  "sentenceCount": 45,
  "avgSentenceLength": 17.27,
  "sentenceStdDev": 6.42,
  "contractionCount": 0,
  "emDashCount": 0,
  "theOpenerPct": 20,
  "maxRepeatedOpenerRun": 2,
  "aiPhraseHits": [],
  "favoriteTransitionHits": [
    "Another reason is that",
    "In the end",
    "Another thing is that",
    "Overall",
    "But",
    "Also"
  ],
  "forbiddenTransitionHits": [],
  "signatureWordHits": [
    "people",
    "because",
    "also",
    "matters",
    "mattered",
    "another",
    "power",
    "world",
    "different",
    "support",
    "reason",
    "rulers"
  ],
  "avoidedWordHits": []
}
```

## Level 1 Essay

```
The Abbasids were able to overthrow the Umayyads because the Umayyads had lost a lot of support among different groups of people, and the Abbasids promised a more fair and inclusive kind of rule. This revolution also reshaped the Islamic world by shifting the center of power to Baghdad and creating a more diverse and culturally rich empire.

One reason the Abbasids succeeded was that many people were mad at how the Umayyads ruled. The Umayyads gave special treatment to Arab Muslims and often pushed non-Arab converts and other groups to the side. This mattered because it created a lot of anger among people who felt left out. For example, in the sources we saw how the mawali, or non-Arab Muslims, were treated as second-class citizens even though they had converted. This shows that the Umayyads were not seen as fair rulers by a big part of the population, which weakened their power.

Another reason is that the Abbasids built a strong movement that united different groups. They promised a more inclusive government where people would be judged by their faith and not just their background. That was important because it gave hope to many who were unhappy with the Umayyads. The Abbasids also used propaganda and secret networks to organize their supporters. This shows how powerful a shared idea can be in bringing people together against a common enemy.

The Abbasid Revolution reshaped the Islamic world by moving the capital from Damascus to Baghdad. This was not just a change of location. It was also a shift in how the empire was run. Baghdad became a new center for trade, learning, and culture. This is important because it helped connect different parts of the empire and made the Abbasids look like powerful and modern rulers. For instance, in class we learned that Baghdad was built near major trade routes, which helped the economy grow. That shows how the revolution changed not just politics but also the daily life of people.

Another thing is that the Abbasids encouraged learning and brought scholars from many backgrounds to work together. This was different from the Umayyads, who were more focused on Arab traditions. The Abbasids supported the translation of Greek and Persian works into Arabic, which helped science and philosophy grow. This matters because it made the Islamic world a center of knowledge that later influenced Europe. It shows that the revolution was not only about power but also about creating a more open and intellectual society.

At the same time, the Abbasids kept some parts of the old system. They still relied on a strong army and bureaucracy to control the empire. But they also made changes, like giving more roles to non-Arabs in government. That was another reason why people supported them. This shows that the Abbasids were smart about mixing old and new ideas to stay in power.

Overall, the Abbasids overthrew the Umayyads because they offered a better deal to a lot of people who felt ignored. The revolution reshaped the Islamic world by making it more diverse, moving its center to Baghdad, and supporting culture and learning. In the end, the Abbasid period was a time of big change that showed how important it is for rulers to have the support of their people.
```

## Level 2 Essay

```
The Abbasids were able to overthrow the Umayyads because a lot of people were already mad at how the Umayyads treated non-Arab Muslims, and they were smart organizers who promised a fair government. The revolution reshaped the Islamic world because it moved the center of power and mixed different cultures together. The Umayyads had controlled the empire for a long time from Damascus, but they made a lot of enemies because they kept pushing people to the side. The Abbasids promised a return to a fair kind of leadership that would actually include everybody. This matters because the revolution was not just a change in who the ruler was. It was a complete change in the culture.

One reason the Abbasids won is that the Umayyads favored Arab elites and treated non-Arab converts badly. Historical accounts show that the Umayyads forced non-Arab Muslims, who were called the mawali, to pay heavy taxes like the jizya even after they converted to Islam. This made people furious. It felt like the rulers only cared about Arab wealth. This matters because when a government treats huge parts of its population unfairly for years, those people will rebel. This shows the Umayyads lost control because they refused to treat all Muslims equally.

Another thing is that the Umayyads kept the best government jobs for Arab Muslims. Records from the time show rulers in Damascus only gave powerful military and political jobs to Arab families. Non-Arabs from places like Persia were treated like second-class citizens in their own society, and this made them feel pushed to the side. This is important because an empire needs talented officials to help run things smoothly. By pushing non-Arabs away, the Umayyads threw away a lot of useful support. This shows that the old system was too exclusive to last forever.

Another reason is that the Umayyads lost religious support from many strict Muslims. Groups like the Shia believed the true leader had to be connected to the Prophet Muhammad's family line. The Umayyads did not have this connection, but they claimed they were the rightful leaders anyway. Whenever people argued against them, the Umayyads strictly shut down the opposition without making compromises. This shows that the Umayyads were already weak on the inside. They relied too much on force instead of building real religious respect.

Even though the Umayyads had problems, the Abbasids also succeeded because they were smart organizers. As lecture material explained, the Abbasids started their rebellion in Khurasan, a Persian region far away from the Umayyad capital. They quietly united Persian groups, angry soldiers, and religious outcasts under leaders like Abu Muslim. This strategy worked perfectly. This is important because they took people who hated the current rulers for different reasons and brought them together under one movement. This shows the Abbasid leaders knew how to use the anger of the people to build a winning army.

The Abbasids also won because they kept their specific plans a little bit vague at first. They promised a better, more religious government that would follow the Prophet's family, but they did not say exactly who would rule. Both the Shia and the Abbasid followers thought their own leader would become the caliph. This matters because it allowed the Abbasid movement to grow fast. It was not just one family fighting another family. It was a massive popular revolution.

The Abbasid Revolution reshaped the Islamic world by moving the political center away from Damascus to build the new city of Baghdad in the east. Moving the capital closer to Persia meant they could mix Arab and Persian cultures together. They even started using Persian ideas about how the government should run. This shows that the Abbasids broke the old system and forced a much more diverse society to appear. It was not an Arab-only empire anymore. It was an international Islamic empire.

Once the Abbasids built Baghdad, it became way more than just where the ruler lived. The city connected different regions of the Abbasid world together. Discussion notes on the House of Wisdom show how scholars translated ancient Greek and Indian books into Arabic and shared new ideas. This is important because the revolution did not just change the laws. It created a massive center of learning and trade. This shows Baghdad was important because it held many parts of the new culture together at once.

Overall, the Abbasid Revolution happened because the Abbasids took advantage of Umayyad mistakes and united angry groups to take power. Once they were in charge, they changed the Islamic world by turning an unfair Arab state into a massive, diverse empire run out of Baghdad. Even though the Umayyads looked powerful from the outside, their unfair rules tore them apart from the inside. In short, the revolution mattered because it proved an empire could not survive on military strength alone. The people had to feel included.
```

## Level 2 + Sources Essay

```
The Abbasids were able to overthrow the Umayyads because they organized angry groups who felt left out, and this revolution reshaped the Islamic world by creating a completely new kind of government. For a long time, the Umayyads said they were the leaders of the entire Muslim world, but they really only gave power to elite Arab families. The Abbasids used this anger to build a much larger base of support and take over. It was not just a change of rulers. It was a complete transformation.

One reason the Abbasids won is that they got major support from non-Arab Muslims. Historical records show that the movement drew huge support from a group called the mawali. These non-Arab Muslims converted to Islam, but they still had to pay higher taxes and did not get top government jobs. This made them very mad at how the empire was being run. The Umayyads probably thought they could just keep ruling this way forever. But they could not. This early backing is a big reason why the Abbasids were able to overthrow the old rulers, because they promised a more fair society to people who were pushed to the side.

Another reason is that the Abbasids were very smart about how they organized their angry supporters into an actual rebellion. Instead of just complaining about the Umayyads, they actively went out and found allies. During the buildup to the revolution, they went to places like Khorasan, which was a region in eastern Persia. This was a good place to start a movement because it was far away from the Umayyad capital and full of people who already wanted change. A local leader named Abu Muslim even helped organize support there, working to bring different groups together under the Abbasid message. The Umayyads had already made enemies out of these groups, and the Abbasids knew how to take advantage of that anger. They quietly built up a massive base of followers before the Umayyads even realized how big the threat was. Connecting these different regions of the Islamic world to fight a common enemy made a huge difference for the Abbasid victory.

Another thing is that the Abbasids used religious history and military strength together to defeat the old empire. They built support by claiming descent from al-Abbas, who was the Prophet's uncle. This gave them a lot of religious authority over regular people. Many Muslims thought the Umayyads were corrupt and cared too much about money. By claiming a family tie to the Prophet, the Abbasids made their movement look holy and rightful. But they did not just rely on ideas and religious claims. They also organized a real army and fought the Umayyads directly, finally defeating them at the Battle of the Zab in 750. The Umayyad army was actually pretty strong, but the Abbasid forces had a lot of momentum and crushed them. That military win matters because their religious message helped them gather people, but their actual armed power was what finally forced the old dynasty to collapse.

The Abbasid Revolution also reshaped the Islamic world by changing how the empire was governed. After taking power, the Abbasids moved the capital to Baghdad. Baghdad mattered because it was not just a place for the ruler to live. It quickly became a center of trade, learning, and administration for the whole empire. Moving the capital closer to Persia also meant the Abbasids started to rely a lot more on Persian officials to help run the government. Under the Umayyads, the government was mostly run by Arabs. Under the Abbasids, the government included many different types of educated people from across the Islamic world. The Abbasids created a huge bureaucracy where these Persian officials helped collect taxes and manage the regions. Moving the center of power east and bringing in new types of administrators proves exactly how the revolution reshaped the Islamic world into something more complex and shared. 

In the end, the Abbasid Revolution happened because unfair Umayyad rule, smart organizing in places like Khorasan, and strong religious claims all came together. The Umayyads pushed a lot of people to the side, and the Abbasids used that anger to build an army. Then, the Abbasids changed the Islamic world by moving the capital to Baghdad and bringing non-Arabs into the government. It was not just a simple change in leadership. It was a completely different way of running an empire. The revolution broke the old Umayyad structure, and then forced a new, more inclusive structure to appear. Overall, the Abbasids won by bringing different angry groups together, and that support completely transformed the history of the Islamic world.
```
