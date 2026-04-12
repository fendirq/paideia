# Generation QA Report

Generated at: 2026-04-12T22:43:11.045Z

## Scenario

Assignment corpus: Abbasid essay prompt + rubric from `output/doc/qa-level2/`.
Student corpus: 4 repo-hosted sample essays from the same folder.
Target word count: 780.

## Level 1 Scores

Heuristic AI resistance: 7/10
Heuristic authenticity: 9/10
Judge AI resistance: 8/10
Judge sample accuracy: 7/10
Judge rubric accuracy: 4/10
Judge evidence handling: 3/10
Judge overall writing: 5/10

Verdict: This essay captures some authentic student voice elements but falls significantly short of the assignment requirements. While it uses casual language and simple sentence structures that match student samples, it lacks the specific historical evidence, clear thesis, and analytical depth required by the rubric. The essay is too short, too vague, and doesn't demonstrate real engagement with course materials.

Strengths: Uses natural, conversational language that sounds authentically student-written; Employs simple sentence structures and casual transitions typical of student work; Attempts to address both causes and consequences as requested; Shows some organizational structure with clear paragraph topics
Weaknesses: Significantly under word count (493 words vs 700-850 required); Lacks specific historical evidence - mentions vague 'sources' and 'class' without concrete examples; No clear thesis statement in introduction; Analysis is superficial and doesn't explain why evidence matters; Missing primary source references or specific lecture material; Overly general statements without supporting details
Priority fixes: Add specific historical evidence with dates, names, and concrete examples; Expand word count to meet assignment requirements; Include a clear thesis statement that makes an argument; Reference actual primary sources or specific course materials; Deepen analysis to explain significance of evidence rather than just stating facts; Add more sophisticated vocabulary while maintaining student voice authenticity

Metrics:
```json
{
  "wordCount": 493,
  "paragraphCount": 6,
  "sentenceCount": 25,
  "avgSentenceLength": 19.72,
  "sentenceStdDev": 6.28,
  "contractionCount": 0,
  "emDashCount": 0,
  "theOpenerPct": 28,
  "maxRepeatedOpenerRun": 1,
  "aiPhraseHits": [],
  "favoriteTransitionHits": [
    "Another reason",
    "Another thing",
    "In the end",
    "Overall",
    "So",
    "But",
    "This shows"
  ],
  "forbiddenTransitionHits": [],
  "signatureWordHits": [
    "a lot",
    "people",
    "things",
    "way",
    "really",
    "kind of",
    "shows",
    "important",
    "because",
    "also",
    "just",
    "more",
    "good",
    "strong",
    "power"
  ],
  "avoidedWordHits": []
}
```

## Level 2 Scores

Heuristic AI resistance: 10/10
Heuristic authenticity: 10/10
Judge AI resistance: 8/10
Judge sample accuracy: 9/10
Judge rubric accuracy: 8/10
Judge evidence handling: 7/10
Judge overall writing: 8/10

Verdict: This essay successfully captures the authentic student voice with natural phrasing, conversational transitions, and genuine analytical thinking. It meets the rubric requirements with a clear thesis, organized structure, and solid historical evidence. However, some evidence integration feels slightly forced, and the writing occasionally becomes more polished than typical student work.

Strengths: Authentic student voice with natural, conversational phrasing like 'anger builds up fast' and 'kind of a signal'; Strong use of signature student phrases and transitions that match the samples; Clear thesis and well-organized structure addressing both causes and consequences; Good historical evidence including mawali taxation, Abu Muslim's role, and the Third Fitna; Effective analysis connecting evidence to broader arguments about the revolution's impact
Weaknesses: Some evidence integration feels slightly artificial, particularly the quoted material from sources; Occasional moments where writing becomes too polished for authentic student work; The Baghdad discussion relies heavily on quoted material rather than student's own analysis; Some transitions between evidence points could be more natural; Word count pushes toward the higher end, which may seem overly comprehensive for this student level
Priority fixes: Make the source integration more natural - paraphrase more, quote less directly; Simplify some of the more complex sentence structures to better match student samples; Reduce reliance on quoted material in the Baghdad section and add more original student analysis; Ensure all evidence feels organically connected to the student's own thinking rather than inserted

Metrics:
```json
{
  "wordCount": 789,
  "paragraphCount": 6,
  "sentenceCount": 35,
  "avgSentenceLength": 22.54,
  "sentenceStdDev": 10.93,
  "contractionCount": 0,
  "emDashCount": 0,
  "theOpenerPct": 25.7,
  "maxRepeatedOpenerRun": 2,
  "aiPhraseHits": [],
  "favoriteTransitionHits": [
    "Another reason",
    "At the same time",
    "In the end",
    "So",
    "But",
    "That is why",
    "In short"
  ],
  "forbiddenTransitionHits": [],
  "signatureWordHits": [
    "a lot",
    "people",
    "things",
    "way",
    "really",
    "kind of",
    "shows",
    "important",
    "because",
    "also",
    "just",
    "more",
    "good",
    "strong",
    "power"
  ],
  "avoidedWordHits": []
}
```

## Level 2 + Sources Scores

Heuristic AI resistance: 10/10
Heuristic authenticity: 10/10
Judge AI resistance: 8/10
Judge sample accuracy: 7/10
Judge rubric accuracy: 9/10
Judge evidence handling: 8/10
Judge overall writing: 8/10

Verdict: This essay demonstrates strong understanding of the assignment and provides solid historical analysis with appropriate evidence. The writing captures many authentic student voice elements like casual phrasing and natural transitions, though it's slightly more polished and structured than the sample writing suggests. The argument is clear and well-developed, meeting rubric requirements effectively.

Strengths: Clear thesis that addresses both causes and consequences as required; Strong use of specific evidence including mawali grievances, religious legitimacy claims, and Battle of the Zab; Natural student voice with phrases like 'a lot of people,' 'way more,' and 'kind of'; Good analysis connecting evidence to broader arguments; Effective organization with focused body paragraphs; Appropriate word count and meets all rubric requirements
Weaknesses: Slightly more sophisticated sentence structure than typical in samples; Some transitions feel more formal than student samples suggest; Occasional phrases that sound slightly too polished for the voice level; Could use more of the casual, conversational tone seen in samples; Missing some of the more informal explanatory phrases common in samples
Priority fixes: Add more casual explanatory phrases like 'This matters because' and 'That is another reason why'; Simplify some complex sentences to match sample writing patterns; Include more informal transitions and connective phrases; Add occasional hedging language like 'probably' or 'seems like' to match student uncertainty patterns

Metrics:
```json
{
  "wordCount": 836,
  "paragraphCount": 6,
  "sentenceCount": 36,
  "avgSentenceLength": 23.22,
  "sentenceStdDev": 9.11,
  "contractionCount": 0,
  "emDashCount": 0,
  "theOpenerPct": 19.4,
  "maxRepeatedOpenerRun": 2,
  "aiPhraseHits": [],
  "favoriteTransitionHits": [
    "Another reason",
    "At the same time",
    "In the end",
    "So",
    "But",
    "This shows",
    "That is why"
  ],
  "forbiddenTransitionHits": [],
  "signatureWordHits": [
    "a lot",
    "people",
    "way",
    "kind of",
    "shows",
    "important",
    "because",
    "also",
    "just",
    "more",
    "good",
    "strong",
    "power"
  ],
  "avoidedWordHits": []
}
```

## Level 1 Essay

```
The Abbasids were able to overthrow the Umayyads because a lot of people were not happy with how the Umayyads ruled, and the Abbasids offered a different and more inclusive way of leading. This revolution also reshaped the Islamic world by making it more open to different kinds of people and moving the center of power to a new capital. The changes that came from this were really important for how Islam grew and changed after that.

Another reason the Abbasids won was because the Umayyads had a lot of problems with how they treated people. The Umayyads mostly favored Arabs and made non-Arabs pay extra taxes, which made a lot of people angry. In the sources, it shows that non-Arab Muslims did not get treated fairly even though they were part of the empire. This was a big reason why many people supported the Abbasids instead. The Abbasids said they would treat everyone equally, and that made people want to join them.

Another thing that helped the Abbasids was that they were really good at organizing and getting support from different groups. They used ideas from Shia Muslims and other groups that also did not like the Umayyads. In class we talked about how the Abbasids promised a more fair kind of rule, and that brought them a lot of allies. This shows that having a strong message and good planning made it easier for them to take power.

The Abbasid Revolution also changed the Islamic world in important ways. One big change was moving the capital from Damascus to Baghdad. Baghdad became a new center for learning and trade, and it was a way more diverse and important city. In the sources, it says that Baghdad had people from many different backgrounds, and that was a big change from the old Umayyad capital. This shows that the revolution made the empire more open to different cultures and ideas.

Another way the revolution reshaped things was through changes in government and culture. The Abbasids did not just keep the same systems as the Umayyads. They built new institutions and supported science and art in a bigger way. For example, in class we learned about the House of Wisdom in Baghdad, where scholars worked on translating books and studying many subjects. This was important because it made the Islamic world a center of knowledge, and it showed that the Abbasids valued learning in a way the Umayyads did not always do.

Overall, the Abbasids were able to take over because the Umayyads made a lot of people unhappy and the Abbasids offered a better and more fair kind of rule. The revolution changed the Islamic world by making it more open and by creating a new capital that became really important for culture and power. In the end, the Abbasid Revolution was a big turning point that made the empire stronger in some ways but also set up new challenges for the future.
```

## Level 2 Essay

```
The Abbasids were able to overthrow the Umayyads because the Umayyads pushed away too many people, and the Abbasids were smart enough to pull those same people toward their side. The revolution did not just change who was in charge. It changed the whole shape of the Islamic world by moving power eastward and making the empire more open to non-Arab Muslims. In short, the Abbasid Revolution happened because of Umayyad failures and Abbasid strategy working together, and what came after was a really different empire than what came before.

One major reason the Abbasids succeeded was that the Umayyads had already made a lot of enemies by treating non-Arab Muslims unfairly. People in places like Persia and Iraq had converted to Islam, but the Umayyad system still treated them like they did not fully belong. These non-Arab converts, called mawali, still had to pay the jizya tax even though that tax was supposed to be only for non-Muslims. When a government tells people they belong but then treats them like they do not, anger builds up fast. The mawali were a huge population ready to support whoever promised something better, and that broken promise of equality is exactly what the Abbasids used to build their movement. Umayyad unfairness was not just a side problem. It was one of the main reasons the revolution was even possible.

Another reason the revolution worked was that the Abbasids did not just wait for the Umayyads to fall apart on their own. They ran a real campaign to build support, especially in Khorasan, which was far from the Umayyad capital of Damascus and full of people who felt ignored. Abu Muslim was the key organizer in that region, and he was really good at bringing different groups together under one cause. Abu Muslim recruited Persian mawali, unhappy Arab settlers, and even some Shia supporters by keeping the Abbasid message broad enough that each group felt included. The Abbasids also claimed the right to lead because of their connection to the Prophet Muhammad's family through his uncle Abbas, which made their cause feel like more than just a power grab. That wide coalition is what gave them the strength to actually win when the fighting started, and it shows how Abbasid strategy was just as important as Umayyad weakness.

The Umayyads also had internal problems that made things easier for the Abbasids. By the 740s they were dealing with rebellions in different parts of the empire, including Berber revolts in North Africa and fighting among their own family over succession. The Third Fitna, basically a civil war inside the Umayyad dynasty, split their leadership right when they needed to be united against the Abbasid threat. Even if the Abbasids had a strong message, it probably would not have worked as well if the Umayyads were more stable. But they were not. Their rule looked strong from the outside but had a lot of cracks in it. The revolution needed both sides of the equation, Abbasid organizing and Umayyad collapse, happening at the same time.

What came after the revolution was just as important as what caused it. Once the Abbasids took over, they moved the capital from Damascus to Baghdad, shifting the center of the Islamic world eastward. This was not just about geography. It was kind of a signal that the empire was going to look different now. The reading on Baghdad describes how the city held the empire together through "government, economics, and culture all together," calling it "the clearest sign of Abbasid strength." The Abbasids also brought in Persian traditions of government, like using viziers and organizing a more complex bureaucracy than the Umayyads had. That same source points out that Baghdad's wealth and reputation made Abbasid power "look real and impressive," which shows the new capital was not just a city but proof that the whole empire had changed direction. All of these changes turned the empire into something where being Muslim mattered more than being Arab, and where the government pulled from traditions across the whole region instead of just one group. That is why a lot of historians treat the Abbasid Revolution as a real turning point.

In the end, the Abbasid Revolution happened because Umayyad policies like unfair taxes on the mawali made a lot of non-Arab Muslims feel like outsiders, the Third Fitna weakened Umayyad leadership from the inside, and the Abbasids were organized enough to take advantage of all that anger through leaders like Abu Muslim and smart coalition building in Khorasan. The world that came after was not just ruled by different people. It was a more open empire centered on Baghdad that changed what Islamic civilization looked like for a long time.
```

## Level 2 + Sources Essay

```
The Abbasid Revolution happened because the Abbasids built a broad coalition of people who were already unhappy with Umayyad rule, and they backed it up with a strong claim to religious leadership through the Prophet's family. Their victory did not just replace one dynasty with another. It shifted the center of the Islamic world eastward, brought new groups into power, and created a more inclusive kind of empire. That is why the revolution matters so much, and why both its causes and consequences changed the direction of Islamic history.

One major reason the Abbasids succeeded was that they got support from groups the Umayyads had pushed to the side, especially the mawali. The mawali were non-Arab Muslims who had converted to Islam but still did not get treated the same as Arab Muslims under Umayyad rule. They faced higher taxes and were shut out of positions of real authority, and that made a lot of people angry over time. According to our Abbasid Revolution notes, the Abbasid movement drew major support from the mawali and from Khorasan specifically, and Abu Muslim helped organize that support into a real military movement. Khorasan was far from the Umayyad center of power in Damascus, and that distance gave the Abbasids room to build up strength before the Umayyads could do much about it. This shows that the Umayyads had a serious weakness they never fixed, and the Abbasids were smart enough to use it by making their revolution feel like it belonged to everyone who had been left out.

Another reason the Abbasids were able to win was their claim to religious legitimacy. The Abbasid Revolution notes point out that the Abbasids claimed descent from al-Abbas, who was the Prophet Muhammad's uncle, and that gave their movement a kind of authority the Umayyads could not easily match. The Umayyads did not have that same direct family connection to the Prophet, so when people compared the two, the Abbasid claim just sounded stronger. This mattered a lot because it turned the revolution into something bigger than one group trying to grab power. If people already thought the Umayyads were unfair rulers, hearing that the Abbasids had a direct connection to the Prophet's family made the whole thing feel like a return to rightful leadership. So the religious claim worked together with the political frustration to make the Abbasid movement feel both legitimate and necessary.

At the same time, the Umayyads had problems of their own that made everything easier for the Abbasids. They had already made enemies through taxes, favoritism toward Arab elites, and the way they handled opposition. Internal divisions within the Umayyad ruling family also weakened them, because they spent energy fighting each other instead of dealing with the growing threat from Khorasan. Even a strong message from the Abbasids would not have worked as well if the Umayyads were more stable. But they were not. Their rule looked strong from the outside but had a lot of cracks in it, and the Abbasids knew how to take advantage of that. This is important because it shows the revolution was not just about Abbasid strength. It was also about Umayyad weakness, and both sides of that had to line up for the overthrow to actually work.

The turning point came at the Battle of the Zab in 750, where the Abbasids defeated the Umayyad army and ended Umayyad control for good. But what happened after the battle changed the Islamic world even more. As the Abbasid Revolution notes describe, after taking power the Abbasids moved the capital from Damascus to Baghdad and started relying more on Persian officials to help run the empire. Baghdad grew into a center of trade, learning, and administration all at once, which shows that the Abbasids were not just trying to sit in the same seat the Umayyads had been sitting in. They were building something different. The eastward shift reflected the coalition that had brought them to power in the first place, since a lot of their strongest support came from Khorasan and from Persian communities who now had a real role in government. By giving those groups actual positions of power, the Abbasids kept their promises in a way that made their new empire feel more legitimate than the old one.

In the end, the Abbasid Revolution succeeded because unfair Umayyad rule, smart organizing by Abu Muslim in Khorasan, and a strong claim to the Prophet's family all came together at the right time. The consequences went way beyond just a change in leadership. By moving the capital to Baghdad and including groups that the Umayyads had ignored, the Abbasids reshaped the direction of the Islamic world and created an empire that looked and worked differently than what came before it. It was not one single cause that made the revolution happen. It was more like pressure building up over time until the old dynasty could not hold on anymore, and the Abbasids were ready to step in with something better.
```
