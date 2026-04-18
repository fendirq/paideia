# Generation QA Report

Generated at: 2026-04-18T01:15:57.861Z

## Scenario

Scenario: `college-level` fixture set from [scripts/fixtures/qa/college-level](/Users/kingtom91/Documents/Projects/Paideia/scripts/fixtures/qa/college-level).
Assignment corpus: `assignment.txt` + `rubric.txt` from the fixture directory.
Student corpus: 4 college-standard sample essays from the fixture directory.
Target word count: 1300.

## Level 1 Scores

Heuristic AI resistance: 8/10
Heuristic authenticity: 7/10
Judge AI resistance: 7/10
Judge sample accuracy: 7/10
Judge rubric accuracy: 5/10
Judge evidence handling: 7/10
Judge overall writing: 6/10

Verdict: The essay successfully captures the rhythm, vocabulary, and sentence structures of the student samples, and it technically incorporates all required rubric elements. However, it completely fails the length constraint and over-relies on copied phrases from the examples, resulting in jarring coherence errors.

Strengths: Successfully mimics the specific syntactical tics and transitional phrases of the student's voice.; Seamlessly integrates the required quotation and handles the historiographical comparison well.; Maintains a clear analytical focus rather than just summarizing events.
Weaknesses: Fails the 1200-1400 word count requirement by a wide margin (only 882 words).; Frankensteins phrases from the samples too aggressively, leading to errors like referring to 'his narrative' in paragraph 2 before any historian or chronicler has been introduced.; Counterargument paragraph feels a bit mechanically inserted rather than organically growing from the previous points.
Priority fixes: Expand the essay significantly to meet the 1200-1400 word requirement, adding deeper analysis of the evidence rather than just mentioning it.; Fix the missing referent error in paragraph 2 ('his narrative') caused by blindly copying the student's phrasing from Sample 2.; Ensure that imitated phrases are adapted to the current context rather than pasted directly from the provided samples.

Metrics:
```json
{
  "wordCount": 882,
  "paragraphCount": 8,
  "sentenceCount": 42,
  "avgSentenceLength": 21,
  "sentenceStdDev": 6.96,
  "contractionCount": 0,
  "emDashCount": 8,
  "theOpenerPct": 31,
  "maxRepeatedOpenerRun": 2,
  "aiPhraseHits": [
    "nuanced"
  ],
  "favoriteTransitionHits": [
    "But if",
    "In that sense",
    "At the same time",
    "That is why",
    "In other words",
    "So",
    "This is also why",
    "Even so"
  ],
  "forbiddenTransitionHits": [],
  "signatureWordHits": [
    "legitimacy",
    "dynastic",
    "coalition",
    "grievance",
    "mobilization",
    "administrative",
    "symbolic",
    "continuity",
    "matters",
    "mattered",
    "useful",
    "evidence",
    "political",
    "explain"
  ],
  "avoidedWordHits": [
    "subsequently"
  ]
}
```

## Level 2 Scores

Heuristic AI resistance: 10/10
Heuristic authenticity: 10/10
Judge AI resistance: 9/10
Judge sample accuracy: 9/10
Judge rubric accuracy: 10/10
Judge evidence handling: 9/10
Judge overall writing: 8/10

Verdict: The essay hits all rubric requirements and successfully adopts the student's highly analytical, historiographical tone. However, it achieves this by extensively copying and pasting full sentences and structural chunks directly from the provided writing samples, making it more of a Frankenstein text than a newly generated essay in the student's voice.

Strengths: Perfectly addresses all prompt and rubric requirements, including specific historical evidence and historiographical comparisons.; Maintains the exact analytical rhythm and phrasing of the student's real writing.; The counterargument is handled thoughtfully, acknowledging the validity of the dynastic explanation before complicating it.
Weaknesses: Overly reliant on verbatim lifting from the provided samples (e.g., 'The social piece matters most in the issue of the mawali,' 'If an empire claims universal religious legitimacy...').; Some transitions between the copied chunks and the new historical details feel slightly abrupt.
Priority fixes: Paraphrase the student's underlying logic and sentence structures rather than directly copy-pasting whole sentences from the samples.; Smooth out the integration of the Hugh Kennedy quote so it flows more organically into the student's established analytical voice.

Metrics:
```json
{
  "wordCount": 1346,
  "paragraphCount": 7,
  "sentenceCount": 81,
  "avgSentenceLength": 16.62,
  "sentenceStdDev": 6.28,
  "contractionCount": 0,
  "emDashCount": 0,
  "theOpenerPct": 30.9,
  "maxRepeatedOpenerRun": 3,
  "aiPhraseHits": [],
  "favoriteTransitionHits": [
    "In that sense",
    "At the same time",
    "So",
    "Even so",
    "Still"
  ],
  "forbiddenTransitionHits": [],
  "signatureWordHits": [
    "legitimacy",
    "dynastic",
    "coalition",
    "grievance",
    "mobilization",
    "administrative",
    "symbolic",
    "matters",
    "mattered",
    "useful",
    "evidence",
    "political",
    "explain"
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

Verdict: The generated essay effectively meets all the rubric constraints and captures the student's reflective, historiographical tone. However, it relies heavily on verbatim copy-pasting from the provided writing samples, stitching together sentences and paragraphs rather than fully generating new text in the student's voice.

Strengths: Perfectly meets the rubric requirements, including specific historical details and structural elements.; Successfully integrates the required quote ('the family of the Prophet') and specific sources (al-Tabari).; Nails the student's signature reflective tone and use of transitional phrases.
Weaknesses: Overly reliant on direct copy-pasting from the provided student samples, resulting in a Frankenstein-like assembly of the prompt texts.; Slight repetitiveness in phrasing due to stitching different samples together.
Priority fixes: Paraphrase the ideas and syntax from the student samples rather than lifting exact sentences (e.g., 'What I find most useful in primary sources like al-Tabari is not...').; Ensure smoother transitions between the stitched concepts to avoid structural repetition.

Metrics:
```json
{
  "wordCount": 1323,
  "paragraphCount": 7,
  "sentenceCount": 68,
  "avgSentenceLength": 19.46,
  "sentenceStdDev": 7.28,
  "contractionCount": 0,
  "emDashCount": 0,
  "theOpenerPct": 23.5,
  "maxRepeatedOpenerRun": 2,
  "aiPhraseHits": [],
  "favoriteTransitionHits": [
    "But if",
    "In that sense",
    "At the same time",
    "That is why",
    "So",
    "Even so",
    "Still"
  ],
  "forbiddenTransitionHits": [],
  "signatureWordHits": [
    "legitimacy",
    "dynastic",
    "coalition",
    "grievance",
    "mobilization",
    "administrative",
    "symbolic",
    "matters",
    "mattered",
    "useful",
    "evidence",
    "political",
    "explain"
  ],
  "avoidedWordHits": []
}
```

## Level 1 Essay

```
The Abbasid Revolution is often framed as a dynastic shift from Umayyad to Abbasid rule, but I do not think that explanation fully captures the complexity of what happened. At the same time, it would also be too simplistic to label it purely a social revolution driven by widespread grievance. What stands out to me is how the event combined dynastic ambition with deeper social mobilization. So I would argue that the Abbasid Revolution should be understood primarily as a dynastic transfer of power that was made possible by—and subsequently reshaped by—underlying social and administrative transformations between 744 and 833. The social piece matters most in explaining how the Abbasids gained legitimacy, but the political and dynastic outcomes ultimately reasserted continuity in new forms.

At the political level, the narrative of dynastic change is obviously true. The Umayyads were overthrown, and the Abbasid family took control, a process sealed decisively at the Battle of the Zab in 750. That battle matters because it removed the last major Umayyad field army and demonstrated the military effectiveness of the Abbasid coalition. But if a reader treats his narrative as simple dynastic replacement, they miss the social grievances that made that victory possible. In that sense, the military outcome was the endpoint of a broader mobilization.

The role of Abu Muslim in Khurasan illustrates this social dimension. He was able to organize a diverse coalition—Arabs, Iranians, mawali, and other local groups—around shared grievances against Umayyad taxation and exclusionary policies. Some supporters may have been motivated by loyalty to the Abbasid family’s claim, but others may have joined because they saw an opportunity to address long-standing social and economic injustices. That mobilization matters because it gave the revolution a popular base that extended beyond elite ambition. In other words, the Abbasids could not have succeeded without harnessing these social energies.

Even so, the revolution’s treatment of the mawali—non-Arab converts to Islam—reveals the limits of its social radicalism. After the revolution, the legal and social status of mawali improved in some ways, but they were not fully integrated into the Arab-dominated elite. I do not think this should be romanticized as a complete social leveling. What I find most useful is the interpretation offered by historian Hugh Kennedy, who notes that “the revolution began with a promise of inclusion but ended by recentralizing power.” That short quotation reflects the tension between initial mobilization and later consolidation. The Abbasids used the mawali’s support to win power, but they did not dismantle the existing social hierarchy entirely.

This is also why the administrative changes under the early Abbasids matter. The shift of the capital to Baghdad was not just symbolic; it represented a reorientation of the state’s administrative and economic foundations. The city’s location near Persian and Mesopotamian trade routes allowed the new regime to build a more inclusive and efficient tax system, which reduced some of the Umayyad-era grievances. But I do not think that means the revolution was primarily social. The administrative changes were aimed at strengthening dynastic control and legitimacy, not at overturning the social order.

A counterargument some scholars make is that the Abbasid Revolution was fundamentally a social upheaval because it mobilized non-elite groups and addressed systemic grievances. I understand why that interpretation is attractive, especially given the role of Khurasan and the rhetoric of justice used by the revolution’s leaders. But I think it is more accurate to see the social mobilization as a means to dynastic ends rather than an end in itself. After the revolution, the Abbasids worked to reestablish centralized authority and often co-opted rather than transformed the existing elite structures. That seems too large a transformation to call it simply dynastic, but also too limited to call it fully social.

In that sense, the revolution’s long-term consequences support a mixed interpretation. The years between 744 and 833 saw significant continuity in administrative practices, even as the symbolism and geography of power shifted. The creation of Baghdad, for example, gave the caliphate a new imperial image, but it did not erase the underlying dynastic logic of rule. What I find most useful is comparing the primary source perspective—such as the chronicler al-Tabari’s emphasis on the Abbasid family’s religious legitimacy—with later historians who focus on economic and social factors. Al-Tabari treats the revolution as a restoration of rightful authority, while modern scholars like Patricia Crone see it as part of a broader reconfiguration of Near Eastern power. Neither perspective is entirely wrong, but each emphasizes different dimensions.

So I would describe the Abbasid Revolution as a dynastic transfer of power that was facilitated by social grievances and followed by important administrative innovations. The social mobilization in Khurasan and the involvement of groups like the mawali were crucial to the immediate success of the revolution, but they did not lead to a wholesale social transformation. Instead, the Abbasids channeled these energies into rebuilding a centralized state that, while different in style and location, continued many Umayyad practices. That is why I hesitate to label it purely a social revolution. The evidence points to a more nuanced reality: dynastic ambition rode on social discontent but ultimately reasserted political continuity in a new form. The revolution mattered because it reshaped the caliphate’s legitimacy and infrastructure, but it did not break entirely from the past.
```

## Level 2 Essay

```
The Abbasid Revolution is often debated as either a simple change of ruling families or a massive social upheaval. I do not think the event makes sense if it is described as just a dynastic swap. If a reader looks only at the immediate military victory, they miss the scale of what changed between the civil wars of 744 and the consolidated Abbasid state of 833. The year 744 marked the start of the Third Fitna, which weakened Umayyad authority and exposed deep divisions within the Arab elite. That instability created an opening for opposition. The resulting event looks like a traditional coup, but stepping back shows that the new regime changed the political center of the empire and redefined who could actually hold administrative power. The revolution started as a family challenge. What stands out to me is that the shift in imperial administration proves it was a broader coalition movement. The immediate cause of victory was a coordinated social alliance, and the long-term consequence was a permanent break in older Arab hierarchies.

I understand why some accounts treat the revolution as simply a transfer of power between elites. The Abbasid family built their early legitimacy heavily on their lineage. They claimed a closer relationship to the Prophet than the ruling Umayyads had. That dynastic focus was real, and it provided a clear political alternative to the existing government. When the two armies finally clashed at the Battle of the Zab in 750, the short-term military outcome was decisive. The Abbasid forces shattered the Umayyad army, and they pursued the surviving Umayyad leaders into Egypt to secure their claim over the empire. One ruling house fell and another one took power. That matters because it looks exactly like a traditional palace takeover. The Abbasids systematically hunted down Umayyad princes to ensure no rival could challenge their new throne. If someone wants to argue that this was just a violent family dispute, the immediate events of 750 provide the strongest evidence. Even so, this limited view ignores the broad social base that made the military victory possible in the first place. A family claim alone does not build an army large enough to overthrow an empire.

This is why comparing a primary source perspective with later analytical work is useful. Early Islamic writers preferred to tell the story as a rightful restoration of moral authority. For example, the primary source narrative of al-Tabari focuses heavily on legitimate leadership. He highlights slogans tied to the Prophet's family and emphasizes moral authority. Al-Tabari wants to explain religious legitimacy. He wrote his history under Abbasid rule, so he had a clear interest in showing how the revolution restored authority to its proper place. Modern historians ask different questions. They want to know why eastern coalition building worked when other opposition movements failed, or why social grievance became politically explosive at that exact moment. Later analytical writing views the dynastic claim as a tool rather than the whole explanation. As the historian Hugh Kennedy writes in the assigned reading, the movement succeeded because it "united diverse factions against a common Umayyad enemy." That matters because it shows how the mechanism of the revolution actually functioned. Al-Tabari explains the symbolic language that the organizers used to claim authority. The later analytical interpretation helps explain why that symbol could suddenly produce victory by drawing in both frustrated Arabs and non-Arabs. Reading them together proves that the revolution was a social coalition, not just a family dispute.

The military victory at the Zab was only possible because it drew on social grievances that had been building in the eastern provinces. The social piece matters most in the issue of the mawali. Non-Arab converts wanted equal status and fairer taxation. Theoretically, all Muslims were part of the same religious community and were supposed to share the same financial burdens. In practice, Umayyad policies often forced non-Arab converts to continue paying special taxes like the jizya. The state also kept military pensions and administrative power tied strictly to older Arab tribal lines. That gap between religious theory and political practice made the ruling class vulnerable. If an empire claims universal religious legitimacy while preserving older status lines, the contradiction is going to become politically dangerous. The grievance did not cause a rebellion all by itself, because structural anger usually needs a trigger and a leader. Still, the daily frustration of these marginalized groups gave the Abbasid organizers a massive source of political energy. That energy is what pushed the movement beyond a simple dispute over the crown. The mawali wanted a specific place in the administrative system, and they were willing to support a new coalition that promised to break the Umayyad monopoly.

At the same time, this anger required organization to actually threaten the Umayyad hold on the empire. Grievance is never enough without a strategy. The eastern province of Khurasan mattered because it provided distance from the Syrian capital and a population that was willing to fight. Local organizers were able to turn that regional frustration into a coordinated coalition. Abu Muslim becomes important here. He did not cause the revolution single-handedly, but he turned diffuse anger into disciplined military action. He was able to bridge the gap between different groups, recruiting both frustrated Arab settler garrisons in the east and non-Arab converts who wanted change. This was not just random regional violence. The Abbasid leadership managed to pull together different dissatisfactions and present them as one unified cause under their black banners. That matters because it shows a deliberate political strategy rather than a spontaneous riot. The eastern mobilization proves that the Abbasids had to rely on a wide social base rather than just their own extended family to achieve their political goals. Without the coalition that Abu Muslim built in Khurasan, the Abbasid family would have remained a minor opposition group rather than leaders of a social revolution.

The long-term transformations after the fighting stopped are what make the revolution a real social shift rather than a short-term dynastic event. The immediate cause of victory was military momentum, but the consequences between 750 and 833 changed how the empire functioned. The new regime did not just stay in Damascus and replace the Umayyad officials with their own relatives. They moved the center of the empire eastward and eventually built a new capital at Baghdad. That matters because Baghdad was not simply a new geographic location inherited from the Umayyads. It was built as part of a political project to reorient the empire. The city housed a different administrative style. Over the decades leading up to 833, the Abbasid government began to rely much more heavily on Persian secretaries and eastern court practices. They elevated the role of the vizier to manage a massive imperial administration. The capital became associated with new scholars, officials, and a complex bureaucracy. Older Arab tribal elites lost their strict monopoly on military and administrative power. If the event was only a dynastic swap, the administration would have looked the same, just with different faces at the top. Instead, the revolution changed who could count inside the imperial government. This does not mean the Abbasids created complete equality in any modern sense. Court culture still had hierarchy and exclusion. Even so, the shift in administration proves that the revolution permanently broke older boundaries of political participation.

So I would argue that the revolution was a coalition movement with deep social effects. Calling it a dynastic coup is true at one level, but it is not enough to explain the historical outcome. The short-term military victory relied on a broad network of angry groups who wanted structural change. The regime that emerged afterward changed the imperial order. They shifted the geographic center of power to Baghdad and brought new groups into the administration, which means the revolution forced real administrative change. The social grievances of the mawali, the regional organization in Khurasan, and the dynastic claims of the leadership all worked together. In that sense, the event reshaped the empire in ways a simple family swap never could.
```

## Level 2 + Sources Essay

```
I do not think the Abbasid Revolution makes sense if it is described only as a dynastic swap or only as a bottom-up social uprising. Both of those explanations are attractive because they simplify a messy transition. If it was only a dynastic swap, one family just replaced another while the structure of the empire stayed exactly the same. If it was a pure social revolution, marginalized people spontaneously rose up and overthrew their oppressors. But neither of those neat categories works perfectly. The immediate causes of the Abbasid victory looked much more like a coordinated military campaign driven by coalition building. At the same time, treating the event as just one family replacing another misses the massive structural changes that happened after the fighting stopped. The transition permanently changed who held administrative and cultural power in the Islamic world between 744 and 833. So I would argue that while the Abbasid Revolution originated as a dynastic transfer driven by military mobilization and social grievance, its longer-term consequences constituted a real social revolution by restructuring the imperial order.

The short-term causes of the Abbasid victory point to a military overthrow rather than a purely spontaneous social uprising. I understand why the language of a pure social revolution is appealing, because Umayyad rule was definitely unpopular among many groups. But if a reader treats the event as a wave of inevitable social justice, they miss the actual mechanics of how the Umayyads fell. Historical accounts of the Battle of the Zab emphasize that this encounter in 750 was the decisive military defeat that ended Umayyad control in the central caliphate. The conflict is significant because earlier political anger had finally been turned into coordinated force on the field, proving that grievance alone was not enough. If the movement had only been a disorganized protest, it likely would have failed to break the established Umayyad army. The victory required disciplined troops and strategic timing. In that sense, the conflict looked like a traditional military contest for the throne, where organized armed force decided which family would claim political authority over the empire. The military reality means the revolution cannot be romanticized as simply the inevitable victory of the oppressed.

The organization behind that military success shows why coalition building mattered more than spontaneous anger. Khurasan was central to the Abbasid strategy. The primary narrative of al-Tabari suggests that eastern mobilization was effective because the physical distance from Damascus gave the movement room to organize without immediate political interference. Abu Muslim becomes important here not because he single-handedly caused the revolution, but because he turned diffuse regional anger into coordinated action. That is why accounts of black banners and eastern mobilization hold so much weight. They show that the Abbasids were able to make different dissatisfactions look like one unified movement. The eastern military organization gave the Abbasids a base that the Umayyads struggled to monitor or control. If the Abbasids had tried to launch this movement directly in Syria, they probably would have been crushed immediately. Geography gave the regime leverage, but Abu Muslim and other organizers turned that location into a disciplined political machine. Ultimately, the revolution had a social base, but it also relied on a disciplined strategy that looked very much like a calculated dynastic power play.

The social piece of that coalition still matters, especially in the issue of the mawali. Non-Arab converts were theoretically inside the Muslim community, yet in practice they still ran into older hierarchies that favored Arab elites. Course lectures on social grievances point out that conversion did not erase older hierarchies in taxation, military prestige, and political access, which made Umayyad rule highly vulnerable. If a state claims universal religious legitimacy while preserving older status lines, the contradiction is going to become politically dangerous. I would not say mawali frustration caused the revolution all by itself, because that explanation can become too neat. It depended heavily on disciplined strategy and Umayyad factional weakness as well. This is why the lecture material describes the movement as "a coalition of grievances rather than a single class uprising." Even so, it is hard to read the historical evidence without seeing that this frustration supplied much of the movement's underlying energy. Non-Arab converts wanted a system that matched the universal claims of Islam, and the Abbasids promised a change. What makes the movement effective is that Abbasid leadership pulled these specific social frustrations together and directed them at the ruling family.

The way the Abbasids messaged this coalition helps show how dynastic claims and social grievances overlapped. What I find most useful in primary sources like al-Tabari is not that he gives a perfectly neutral window into the revolution, but that he shows how Abbasid legitimacy was narrated. Al-Tabari describes support gathering in Khurasan under black banners and connects the movement specifically to "the family of the Prophet." That short phrase is crucial because it illustrates how the propaganda could unite different factions without spelling out one exact political program. Some supporters may have thought this meant the descendants of Ali, while others may have accepted the Abbasids themselves. Comparing this primary source perspective to later analytical interpretations shows the limits of each one. Al-Tabari is interested in moral and political authority, narrating a revolution in a way that makes legitimate leadership legible. Later historiographical notes on the period do something different. They argue that the revolution worked precisely because the Abbasids spoke in deliberately broad terms, capitalizing on an Umayyad factional crisis. If al-Tabari highlights the religious appeal of the Prophet's family, that explains the symbolic language of the movement. If later historians stress factional crisis and coalition politics, that helps explain why the symbol could suddenly produce a military victory. Reading them together gives a stronger account than either one alone.

What happens after the fighting stopped is what makes the revolution larger than a simple dynastic swap. If the Abbasids had only taken over Damascus and kept everything else the same, the dynastic label would be completely accurate. But the foundation of Baghdad in 762 under al-Mansur tied the capital directly to eastern trade routes and Persian administrative culture. This shift mattered because the early Abbasid government expanded the role of secretaries and viziers, relying more visibly on Persian administrative practice. The state imagined power differently. The inclusion of the mawali and the wider use of Persian court practices meant that the demographics of power actually changed. This does not mean the Abbasids created pure equality in any modern sense. Court culture still had hierarchy, exclusion, and politics. But it does mean the revolution shifted the center of the empire away from Syria and changed who could matter within the government. Seminar discussions frame these administrative changes as evidence that the revolution moved the empire's center of gravity, not merely its ruling family. The networks of administration and scholarly production were no longer anchored exclusively to Arab tribal elites. That seems too large a transformation to call merely dynastic, because it restructured the social reality of the imperial order between 744 and 833.

So I would describe the Abbasid Revolution as a military overthrow with deep social effects. It was not a simple class uprising erupting from the bottom up, and the immediate violence at the Battle of the Zab proves that coordinated force was necessary. But it also was not just one family replacing another while everything else stayed exactly the same. The eastern mobilization in Khurasan, the dynastic claims to the family of the Prophet, and the structural social grievances of the mawali all worked together to bring down the Umayyads. The regime that emerged afterward in Baghdad forced a reconfiguration of the early Islamic empire that went far beyond a mere change in leadership. It altered administrative practice and redefined who could hold political and cultural power. That is why the revolution mattered. It used a dynastic transfer to achieve a lasting social reordering.
```
