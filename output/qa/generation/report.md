# Generation QA Report

Generated at: 2026-04-18T00:41:51.287Z

## Scenario

Assignment corpus: Abbasid essay prompt + rubric from `output/doc/qa-level2/`.
Student corpus: 4 repo-hosted sample essays from the same folder.
Target word count: 780.

## Level 1 Scores

Heuristic AI resistance: 10/10
Heuristic authenticity: 9/10
Judge AI resistance: 9/10
Judge sample accuracy: 9/10
Judge rubric accuracy: 4/10
Judge evidence handling: 7/10
Judge overall writing: 8/10

Verdict: The generated essay does an excellent job of mimicking the student's authentic voice, relying on colloquialisms ('were already mad', 'smart about building alliances') and identical analytical transitions ('This shows that', 'This mattered because') found in the provided writing samples. However, it severely misses the requested word count (551 words instead of the required 700-850), significantly impacting its rubric score.

Strengths: Perfectly captures the student's straightforward, slightly informal tone.; Replicates the exact analytical sentence structures used by the student in the provided samples.; Clearly answers both halves of the prompt by explaining causes and consequences in organized body paragraphs.
Weaknesses: Fails the 700-850 word count requirement by nearly 150 words.; Relies on a copied transition ('In the sources, you can see that') from Sample 1 without actually naming a specific source.; Paragraph transitions are slightly too repetitive ('Another reason is that', 'Another thing is that').
Priority fixes: Expand the essay with additional specific historical evidence and further explanation to meet the minimum 700-word requirement.; Name specific primary sources or lecture materials when referring to 'the sources'.; Vary the transitions at the beginning of body paragraphs to avoid overly repetitive phrasing.

Metrics:
```json
{
  "wordCount": 551,
  "paragraphCount": 7,
  "sentenceCount": 30,
  "avgSentenceLength": 18.37,
  "sentenceStdDev": 6.65,
  "contractionCount": 0,
  "emDashCount": 0,
  "theOpenerPct": 23.3,
  "maxRepeatedOpenerRun": 3,
  "aiPhraseHits": [],
  "favoriteTransitionHits": [
    "Another reason is that",
    "In the sources, you can see that",
    "This shows that",
    "In the end",
    "This shows",
    "Another thing is that",
    "Even though",
    "This is important because",
    "So"
  ],
  "forbiddenTransitionHits": [],
  "signatureWordHits": [
    "a lot",
    "because",
    "important",
    "also",
    "shows",
    "mattered",
    "support",
    "society",
    "different",
    "power",
    "world"
  ],
  "avoidedWordHits": []
}
```

## Level 2 Scores

Heuristic AI resistance: 10/10
Heuristic authenticity: 10/10
Judge AI resistance: 10/10
Judge sample accuracy: 10/10
Judge rubric accuracy: 10/10
Judge evidence handling: 9/10
Judge overall writing: 9/10

Verdict: This is an exceptionally strong mimicry of the provided student samples. It seamlessly weaves in phrases and syntactic structures directly from the samples while perfectly satisfying the rubric's requirements for evidence, analysis, and word count.

Strengths: Flawless adoption of the student's slightly conversational but earnest academic tone (e.g., 'Another thing is that...', 'a lot of people were angry').; Precise adherence to the rubric, providing exactly three specific pieces of historical evidence and analyzing them.; Maintains excellent structural flow that feels highly authentic to an average-to-strong student writer.; Strong avoidance of AI-isms and zero use of unnatural vocabulary.
Weaknesses: Source and evidence introductions are occasionally clunky and announced rather than integrated ('A good piece of evidence for this is...', 'Historical records of the House of Wisdom provide a clear piece of evidence for this...'), though this is typical for students.; The conclusion relies a bit heavily on repetitive summary.
Priority fixes: Slightly smooth out the evidence announcements so they don't feel entirely copy-pasted, while maintaining the student's developing analytical voice.

Metrics:
```json
{
  "wordCount": 847,
  "paragraphCount": 5,
  "sentenceCount": 49,
  "avgSentenceLength": 17.29,
  "sentenceStdDev": 7.63,
  "contractionCount": 0,
  "emDashCount": 0,
  "theOpenerPct": 20.4,
  "maxRepeatedOpenerRun": 3,
  "aiPhraseHits": [],
  "favoriteTransitionHits": [
    "This shows that",
    "Even if",
    "In the end",
    "This shows",
    "Another thing is that",
    "But",
    "So",
    "That is why"
  ],
  "forbiddenTransitionHits": [],
  "signatureWordHits": [
    "a lot",
    "because",
    "important",
    "also",
    "shows",
    "mattered",
    "support",
    "society",
    "evidence",
    "different",
    "power",
    "world",
    "really"
  ],
  "avoidedWordHits": []
}
```

## Level 2 + Sources Scores

Heuristic AI resistance: 10/10
Heuristic authenticity: 10/10
Judge AI resistance: 9/10
Judge sample accuracy: 9/10
Judge rubric accuracy: 10/10
Judge evidence handling: 9/10
Judge overall writing: 8/10

Verdict: The essay is a highly authentic replication of the student's voice, successfully employing the student's specific analytical structures (e.g., 'This matters because...') and colloquial vocabulary. It meets all rubric requirements, though the source integration is a bit clunky and repetitive.

Strengths: Perfectly hits the rubric requirements for word count, thesis, evidence, and analysis.; Captures the student's exact tone, using simpler vocabulary and straightforward sentence structures typical of the provided samples.; Effectively explains the 'why' and 'how' of the evidence using the student's signature analytical transitions.
Weaknesses: Relies somewhat too heavily on copy-pasting exact sentences from the provided writing samples.; Features a noticeable generation artifact/typo ('The Abbasid The Abbasid Revolution notes shows').; Source introductions are highly repetitive ('The Abbasid Revolution notes shows/state').
Priority fixes: Fix the typo 'The Abbasid The Abbasid Revolution notes' in the second paragraph.; Vary the phrasing used to introduce evidence so it doesn't always rely on 'The Abbasid Revolution notes'.; Paraphrase the lifted lines from Sample 1 slightly so it doesn't read as self-plagiarism.

Metrics:
```json
{
  "wordCount": 765,
  "paragraphCount": 5,
  "sentenceCount": 39,
  "avgSentenceLength": 19.62,
  "sentenceStdDev": 6.64,
  "contractionCount": 0,
  "emDashCount": 0,
  "theOpenerPct": 33.3,
  "maxRepeatedOpenerRun": 2,
  "aiPhraseHits": [],
  "favoriteTransitionHits": [
    "This shows that",
    "Even if",
    "In the end",
    "This shows",
    "But",
    "This is important because",
    "So"
  ],
  "forbiddenTransitionHits": [],
  "signatureWordHits": [
    "a lot",
    "because",
    "important",
    "also",
    "shows",
    "support",
    "society",
    "different",
    "power",
    "world"
  ],
  "avoidedWordHits": []
}
```

## Level 1 Essay

```
The Abbasids were able to overthrow the Umayyads because of widespread anger at their unfair policies and because they promised a more inclusive and just society, and this revolution reshaped the Islamic world by shifting its political center and promoting cultural diversity. The Umayyad leaders were seen as favoring Arab elites and ignoring other groups, which made a lot of people unhappy. The Abbasids used this anger to build support and win power.

Another reason is that the Abbasids were smart about building alliances. They reached out to non-Arab Muslims and other groups who felt left out by the Umayyads. For example, the Abbasids promised equality and justice to Persians and other communities, and that brought them important support. This shows that the Abbasids knew how to connect with different parts of the population, not just the powerful few. They made people believe that change was possible, and that mattered because it gave them a huge advantage in the rebellion.

In the sources, you can see that the Umayyads had a lot of internal problems too. There were conflicts over leadership and money, and many people were already mad at them for high taxes and corruption. This made the empire weaker and easier to challenge. The Abbasids took advantage of this by organizing a strong military campaign, and they were able to defeat the Umayyads in battles like the one at the Zab River. This shows that the Abbasids did not just rely on promises; they also had a clear plan and the resources to carry it out.

The Abbasid Revolution reshaped the Islamic world in a big way. One important change was the move of the capital from Damascus to Baghdad. This was not just a political decision; it was also a way to create a new center for culture and learning. Baghdad became a place where scholars, artists, and traders from many backgrounds could come together. This is important because it helped spread ideas and made the Islamic world more connected and innovative.

Another thing is that the Abbasids changed how the government worked. They created a more bureaucratic system with officials from different regions, not just Arabs. This made the empire more stable and fairer for everyone. For example, they used Persian administrators and adopted some of their traditions, which showed a willingness to include different cultures. This mattered because it made the government stronger and more representative, and it helped keep the empire together for a long time.

Even though the Mongols eventually ended the Abbasid Caliphate, the changes from the revolution lasted. The focus on knowledge and culture in places like Baghdad had a huge impact on the world, preserving ancient texts and encouraging new discoveries. This shows that the revolution was not just about who was in charge; it was also about creating a society that valued learning and diversity.

In the end, the Abbasids overthrew the Umayyads because they understood the problems of the old system and offered a better alternative. They reshaped the Islamic world by making it more inclusive and culturally rich. The revolution was a turning point that showed how important fairness and diversity are for a society to grow and last. It was not just a change in rulers; it was a change in how the whole empire saw itself.
```

## Level 2 Essay

```
The Abbasids were able to overthrow the Umayyads because a lot of people were angry about unfair Umayyad rules, and the revolution reshaped the Islamic world by moving the center of power to Baghdad and mixing different cultures together. The Umayyads said they were the leaders of the Muslim world, but a lot of non-Arab Muslims did not feel included at all. The government only really cared about Arab power. This matters because if a government keeps acting unfair for a long time, the people will eventually find somebody else to support. They wanted real change. The Abbasid Revolution was not just a political rebellion. It was also a massive shift that changed the society completely.

One major reason the Abbasids won is that the Umayyads had already made a lot of enemies. A good piece of evidence for this is the way the Umayyad rulers handled taxes and government jobs for non-Arab Muslims, who were called the mawali. Even if someone from a different background converted to Islam, the Umayyads still made them pay special taxes. Lecture material on the empire's economy explains that these non-Arab converts were forced to pay the jizya tax, which was supposed to be just for non-Muslims. They also kept all the top positions in the empire for Arab families. This shows that the Umayyads were acting unfair and only looking out for their own wealth. It is important because it made a huge part of the population feel pushed to the side. When people feel like the rules are rigged against them, they start looking for a way to break the system. The Umayyads looked strong from the outside, but they had a lot of cracks in their rule because they relied on favoritism. That made everything easier for the Abbasids to step in. It was more like pressure building up over time until the old dynasty could not really hold on anymore.

Another reason the revolution succeeded is that the Abbasids organized a huge movement to bring different groups together. They did not just gather people who were mad. They also promised a return to a more fair kind of leadership. Historical accounts of the revolution describe how the Abbasids reached out to people in a region called Khurasan and built a secret network. They used a leader named Abu Muslim to recruit an army of ordinary people and non-Arabs who thought the Umayyad rulers had lost their way. Propaganda from the movement shows that the Abbasids used black banners to spread the message that they would rule like true Muslims and treat everyone equally, no matter where they came from. This matters because the Abbasid leaders were smart. They united all these frustrated people against one common enemy, turning small complaints into a huge army that could actually win a war. They realized that they could not beat the Umayyads alone, so they made their movement feel bigger than one family fighting another family. Because they built strong support networks across different regions, they had the resources to actually win. The old system could not survive.

Another thing is that the Abbasids totally changed the geography and culture of the empire after winning the war. Instead of staying in Damascus, they built a brand new capital called Baghdad, and that shifted the whole focus of the Islamic world toward the East. By moving closer to Persia, the Abbasids could control major trade routes and bring in Persian ideas to help run the state. They started hiring Persian officials to work high up in the government, which proved they were actually keeping their promise to share power. Baghdad mattered because it was not just a political capital. It was also a massive center of learning. Historical records of the House of Wisdom provide a clear piece of evidence for this, showing how scholars translated old Greek and Indian books into Arabic. They did not just focus on the military. They also spent a lot of money to support science, math, and philosophy. This shows that the revolution was a cultural turning point. Because the government supported learning, scholars from all over the world traveled to the new capital to work together. This matters because it created a society where different cultures could mix and share knowledge, making Abbasid power look real and impressive. The revolution completely changed what the empire valued.

In the end, the Abbasid Revolution happened because unfair rule, smart organizing, and the anger of people who felt pushed to the side all came together. It was not one single cause. The Umayyads lost because they refused to treat non-Arabs fairly, and the Abbasids won because they knew how to take advantage of that weakness. The result was the end of an old system and the start of a society that actually valued different cultures. The new empire was centered in Baghdad, run by people from different backgrounds, and focused on learning just as much as power. That is why the revolution mattered so much. It broke one structure, and then forced a different one to appear.
```

## Level 2 + Sources Essay

```
The Abbasids were able to overthrow the Umayyads because a lot of people were already mad at how the government was running things, and the Abbasid Revolution reshaped the Islamic world by moving its center to Baghdad. The Umayyads said they were the leaders of the entire Muslim world, but many non-Arab Muslims did not feel included in the government at all. These people were paying higher taxes and getting fewer rewards, even if they were loyal to the state. This matters because if a government keeps acting unfair for a long time, everyday people start looking for somebody else to follow. That gave the Abbasids a perfect opening to start a huge movement against them. The Umayyads had already made a lot of enemies through favoritism and harsh rules. The old system looked strong from the outside, but it was already falling apart.

Another reason the revolution worked is that the Abbasids built a massive rebellion by focusing on the exact groups of people who were angry. The Abbasid The Abbasid Revolution notes shows that they drew major support from the mawali and from Khorasan, which was a region far away from the capital and full of unhappy soldiers. The notes also explain that a leader named Abu Muslim helped organize all of this support in Khorasan into a real army. He did not just say the Umayyads were bad, but he actually gathered forces and convinced different groups to fight together against the old rulers. This army marched west and finally defeated the Umayyads at the Battle of the Zab in 750. The Umayyad forces were crushed, and their rule ended. This is important because it shows how the Abbasids won partly because they gave a loud voice to people who felt pushed to the side. They turned popular frustration into real military power, and that was a main cause of their victory.

The Abbasids also used religion to make their rebellion look much more official to ordinary Muslims. According to the Abbasid Revolution notes, the leaders claimed descent from al-Abbas, who was the Prophet's uncle. They used this powerful family connection to prove they were the true leaders of Islam. A lot of Muslims already thought the Umayyads were corrupt and mostly cared about money and earthly power. When the Abbasids reminded everyone about their family ties to the Prophet, it sounded like a promise to return to a more fair and holy kind of leadership. This made people feel confident that they were fighting for a good religious cause, not just a regular political war. This matters because it made the Umayyads look like they did not have a real religious right to rule the huge empire anymore. If the Abbasids were the family of the Prophet, then fighting for them was the right thing to do. Ideas matter just as much as armies.

The Abbasid Revolution did not just change who was in charge politically, but it also changed where the empire was centered and how it worked on the inside. After taking power, the Abbasid Revolution notes state that the new leaders moved the capital to Baghdad and relied more on Persian officials instead of just Arab leaders. Persian ideas about how to run a complex state became very important, and this made the new government much stronger. The notes also point out that Baghdad quickly became a center of trade, learning, and administration for the entire region. Scholars came there to work, merchants passed through with valuable goods, and important officials helped run the vast Abbasid world from one place. This shows that the revolution reshaped the Islamic world because it was about building up culture and economics, not just winning a war against an old dynasty. The capital was not just a place where the caliph lived anymore. The whole empire looked completely different.

In the end, the Abbasid Revolution happened because unfair Umayyad rule, smart military organizing, and powerful family history all came together at the perfect time. The old rulers made too many enemies, and the Abbasids knew exactly how to use that anger to win battles. Once they were in power, the revolution shifted the entire Islamic world eastward toward Baghdad. That shift allowed Persian culture and administration to change the way the government actually ran. It gave more power to the mawali and created a golden age of trade and learning that connected different regions together. It was not just a simple military takeover, but it was a complete transformation of the whole society. They broke one old system just to build another.
```
