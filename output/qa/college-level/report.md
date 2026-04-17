# Generation QA Report

Generated at: 2026-04-17T23:52:00.068Z

## Scenario

Scenario: `college-level` fixture set from [scripts/fixtures/qa/college-level](/Users/kingtom91/Documents/Projects/Paideia/scripts/fixtures/qa/college-level).
Assignment corpus: `assignment.txt` + `rubric.txt` from the fixture directory.
Student corpus: 4 college-standard sample essays from the fixture directory.
Target word count: 1300.

## Level 1 Scores

Heuristic AI resistance: 8/10
Heuristic authenticity: 9/10
Judge AI resistance: 4/10
Judge sample accuracy: 3/10
Judge rubric accuracy: 5/10
Judge evidence handling: 6/10
Judge overall writing: 4/10

Verdict: The essay fails the word count requirement significantly and suffers from a glaring structural generation error, while also relying too heavily on copy-pasting exact phrases from the provided writing samples.

Strengths: Addresses the core prompt and touches on all the required topical elements (Abu Muslim, mawali, Zab, Baghdad).; Successfully includes a counterargument.; Attempts the primary vs. analytical source comparison required by the rubric.
Weaknesses: Paragraph 4 starts with 'What he gives instead is an explanation...' but 'he' has no antecedent. This is a fatal AI generation/splicing error.; Fails the 1200-1400 word count requirement by coming in at 922 words.; The voice emulation relies on franken-splicing exact sentences from the provided samples (e.g., 'I do not think this should be romanticized into a story of...') rather than learning the underlying style.; The required quotation is very weak ('the people of Khurasan') and barely constitutes citing a text.
Priority fixes: Fix the missing antecedent at the start of paragraph 4 ('What he gives instead...').; Expand the analysis to meet the 1200-word minimum.; Generate original sentences in the student's analytical, first-person voice rather than directly lifting entire phrases from the reference samples.; Integrate a more substantial and specific quotation from the primary sources.

Metrics:
```json
{
  "wordCount": 922,
  "paragraphCount": 8,
  "sentenceCount": 51,
  "avgSentenceLength": 18.08,
  "sentenceStdDev": 6.99,
  "contractionCount": 0,
  "emDashCount": 5,
  "theOpenerPct": 27.5,
  "maxRepeatedOpenerRun": 2,
  "aiPhraseHits": [],
  "favoriteTransitionHits": [
    "But if",
    "What stands out to me is that",
    "In that sense",
    "At the same time",
    "In other words",
    "What he gives instead",
    "This is also why",
    "Even so",
    "So I would describe",
    "So I would argue"
  ],
  "forbiddenTransitionHits": [],
  "signatureWordHits": [
    "matter",
    "mattered",
    "makes sense",
    "obviously",
    "explanation",
    "grievance",
    "mobilization",
    "legitimacy",
    "useful",
    "symbolic",
    "administrative",
    "romanticized",
    "evidence",
    "reconfiguration"
  ],
  "avoidedWordHits": []
}
```

## Level 2 Scores

Heuristic AI resistance: 6/10
Heuristic authenticity: 10/10
Judge AI resistance: 9/10
Judge sample accuracy: 10/10
Judge rubric accuracy: 10/10
Judge evidence handling: 9/10
Judge overall writing: 9/10

Verdict: This is an exceptionally strong generated essay that flawlessly fulfills the rubric while perfectly mimicking the student's unique voice. It adopts the student's exact rhetorical moves, sentence structures, and transitional devices from the provided samples, blending them seamlessly with the specific historical evidence required by the prompt.

Strengths: Perfectly captures the student's analytical, slightly conversational yet academic tone (e.g., 'What stands out to me is that...', 'I understand why someone might argue...').; Integrates all required historical evidence (jizya, Abu Muslim, Battle of the Zab, Barmakids, Baghdad) accurately and purposefully to support the thesis.; The source integration of al-Tabari is handled exactly as the rubric requests, using the student's authentic framework for comparing primary narratives to later analytical texts.; Answers the counterargument gracefully and seriously without resorting to AI-style 'straw man' dismissals.
Weaknesses: The essay leans heavily on the exact phrasing of the provided samples, bordering on self-plagiarism of the student's past work rather than generating entirely new sentences in the same style.; A few transitions feel slightly repetitive due to the heavy reliance on the student's signature phrases ('Even so', 'In other words').
Priority fixes: Vary the sentence structures slightly more to avoid direct copy-pasting of whole clauses from the training samples, ensuring the voice emulation feels organic rather than purely mapped.

Metrics:
```json
{
  "wordCount": 1240,
  "paragraphCount": 8,
  "sentenceCount": 59,
  "avgSentenceLength": 21.02,
  "sentenceStdDev": 6.42,
  "contractionCount": 0,
  "emDashCount": 0,
  "theOpenerPct": 28.8,
  "maxRepeatedOpenerRun": 3,
  "aiPhraseHits": [],
  "favoriteTransitionHits": [
    "What stands out to me is that",
    "At the same time",
    "In other words",
    "Even so",
    "So I would argue"
  ],
  "forbiddenTransitionHits": [],
  "signatureWordHits": [
    "matter",
    "mattered",
    "makes sense",
    "obviously",
    "grievance",
    "mobilization",
    "legitimacy",
    "contradiction",
    "administrative",
    "project",
    "evidence",
    "reconfiguration"
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
Judge overall writing: 9/10

Verdict: The essay effectively hits all rubric requirements and masterfully mimics the student's tone and analytical phrasing. However, the voice relies slightly too much on direct verbatim copy-pasting from the samples, and the integration of course materials feels incredibly clunky ('the provided excerpt', 'the historiographical note provided in the packet').

Strengths: Perfectly captures the student's analytical, first-person voice and transition style.; Follows the prompt's constraints meticulously, including the specific counterargument and historiographical comparison.; Strong, analytical topic sentences that avoid mere summary.
Weaknesses: Over-relies on verbatim copying of full sentences from the provided samples (e.g., 'What I find most useful in al-Tabari is not that he gives a perfectly neutral window...').; Source attribution is jarring and unnatural, constantly referencing 'the packet,' 'the lecture packet,' or 'the seminar notes' instead of simply engaging the ideas or authors.; The transition between the student's organic phrases and the AI's source-dropping can feel disjointed.
Priority fixes: Remove meta-references to 'the packet' or 'the provided excerpt' and integrate sources by referencing the authors, historians, or concepts directly.; Paraphrase the student's stylistic quirks more rather than copying entire sentences from the samples verbatim.; Smooth out the mechanics of the source quotations to feel more integrated into the analytical narrative.

Metrics:
```json
{
  "wordCount": 1230,
  "paragraphCount": 7,
  "sentenceCount": 67,
  "avgSentenceLength": 18.36,
  "sentenceStdDev": 7.87,
  "contractionCount": 0,
  "emDashCount": 0,
  "theOpenerPct": 23.9,
  "maxRepeatedOpenerRun": 2,
  "aiPhraseHits": [],
  "favoriteTransitionHits": [
    "But if",
    "What stands out to me is that",
    "At the same time",
    "What I find most useful",
    "What he gives instead",
    "Even so",
    "So I would argue"
  ],
  "forbiddenTransitionHits": [],
  "signatureWordHits": [
    "matter",
    "mattered",
    "makes sense",
    "obviously",
    "explanation",
    "grievance",
    "mobilization",
    "legitimacy",
    "contradiction",
    "useful",
    "symbolic",
    "administrative",
    "evidence",
    "reconfiguration"
  ],
  "avoidedWordHits": []
}
```

## Level 1 Essay

```
I do not think the Abbasid Revolution makes sense if we treat it only as a dynastic change from Umayyad to Abbasid family rule. What stands out to me is that the revolution was both a political takeover and a social transformation, and the social piece matters most for explaining its lasting importance. The dynastic claim was obviously part of the appeal, but it was the mobilization of social grievance—especially among non-Arab converts (mawali) and marginalized groups—that gave the movement its force and made its outcomes more than just a shift at the top.

The mawali question is essential here. If a reader treats the revolution only as a change of dynasty, then the grievances of the mawali seem secondary. But if we see the mawali as central, then the revolution starts to look different. In the Umayyad period, non-Arab Muslims often faced discrimination in status and taxation, even after conversion. That made them a source of potential support for any movement promising change. The Abbasids, through their agent Abu Muslim in Khurasan, built their base partly by appealing to these groups. Some supporters may have imagined the revolution would bring equality, while others may have simply heard the promise of justice and inclusion. This does not mean the Abbasids created equality immediately after taking power. It does mean the revolution changed who could count on political legitimacy and who felt included in the empire.

At the same time, the military dimension cannot be ignored. The Battle of the Zab in 750 was the decisive moment when the Abbasid forces defeated the Umayyad army. That victory mattered because it showed the Abbasids could win a conventional battle, not just lead a regional rebellion. But I would not say this makes the revolution purely a military event. The soldiers Abu Muslim mobilized in Khurasan were not just professional troops; many came from groups with social and economic complaints against the Umayyads. So the battle was the endpoint of a broader mobilization. In other words, the military success relied on social discontent.

What he gives instead is an explanation that links immediate events to longer-term change. The consequences after 750 matter as much as the causes. One detail that keeps standing out is the administrative shift that followed. The Abbasids moved the capital from Damascus to Baghdad, and this was more than a symbolic change. The new capital was positioned to better control eastern trade routes and integrate Persian administrative practices. This reconfiguration made the state more efficient in some ways, but it also created new channels for non-Arab elites to enter government. That evidence suggests the revolution did not just replace one ruling group with another; it altered how power was organized and who could access it.

This is also why the comparison with primary sources is useful. The historian al-Tabari, writing later, describes Abu Muslim’s rise in almost legendary terms, focusing on his leadership and military success. But if we read his account carefully, we also see hints of the social tensions underneath. For example, he notes how Abu Muslim appealed to “the people of Khurasan” with promises of justice, not just loyalty to the Abbasid family. A modern historian like Hugh Kennedy, by contrast, emphasizes the social and economic factors more directly. He argues that the revolution succeeded because it tapped into widespread dissatisfaction with Umayyad privilege. The difference is not that one is right and the other wrong, but that together they show how dynastic and social explanations can overlap.

I do not think this should be romanticized into a story of pure social liberation. The Abbasids did not overturn hierarchy entirely. Old elites lost power, but new ones emerged, and many inequalities persisted. Even so, the revolution opened space for new groups—especially Persian and other non-Arab Muslims—to gain influence. This matters because it changed the cultural and political landscape of the empire for centuries. In that sense, the revolution was both a dynastic event and a social one, but the social transformation gave it lasting impact.

One counterargument that deserves attention is the idea that the Abbasid Revolution was mostly about legitimacy and religious claims, not social change. Some scholars point to the Abbasid use of Shi’a-like rhetoric about the “rightly guided” imam to argue that the movement was ideological first and social second. I understand why that interpretation makes sense, especially since religious language appears often in the sources. But if the revolution had been only about religious legitimacy, it is hard to explain why it found such strong support in regions like Khurasan, where social and economic complaints were widespread. The religious appeal worked because it resonated with existing grievances. So I would argue that the social and religious dimensions were connected, not separate.

So I would describe the Abbasid Revolution as a dynastic shift that was made possible by social mobilization and that led to significant social and administrative change. It was not a simple class uprising that erased old elites completely. But it also was not just one family replacing another at the top. The revolution mattered because it combined political ambition with social energy, and that combination is what allowed the Abbasids to build a different kind of empire. The evidence from mawali mobilization, military recruitment, administrative changes, and capital relocation all point toward a transformation that was broader than dynasty alone. What makes the revolution most interesting, though, is that it shows how political power can be reshaped when social forces are activated—not as a clean break, but as a reconfiguration that lasts.
```

## Level 2 Essay

```
I do not think the Abbasid Revolution makes sense if it is described only as a sudden collapse of one ruling family between 744 and 750. That part is obviously true at one level, because the Umayyads fell and the Abbasids took power through military force. If someone wanted to argue that it was just a dynastic swap, the immediate events provide the strongest evidence for that position. But I think it is more accurate to say that this political rupture actually began a much larger social reconfiguration that unfolded over the next century. What stands out to me is that the revolution mattered most because it slowly replaced an exclusionary Arab tribal system with a new imperial order. The Umayyads built their authority on Arab lineage and military conquest, which made their government look like an extended tribal coalition. The conquest elite enjoyed privileges in taxation and military stipends, while the newly converted populations were expected to pay the financial costs of the empire. The new Abbasid regime dismantled that Arab-exclusive aristocracy and integrated the non-Arab mawali into central administration between 750 and 833. If we only look at the replacement of the caliph, we miss the fact that the entire definition of who belonged in the ruling class changed.

The social piece becomes much clearer when looking at the structural issue of the mawali. Non-Arab converts were theoretically equal members of the Islamic community, yet in practice they faced strict hierarchies that heavily favored Arab elites in taxation and government roles. For example, Umayyad governors often continued to charge the mawali the jizya, a tax traditionally meant only for non-Muslims, simply to maintain state revenue. That contradiction is one of the clearest reasons Umayyad rule became vulnerable to organized opposition. If a state claims universal religious legitimacy while preserving an older status line, that system will eventually become politically dangerous. The financial burden placed on the newly converted populations created deep resentment across the eastern provinces. The grievance of the mawali did not cause the revolution all by itself, but it gave marginalized groups a clear material and religious justification to rebel against Damascus. 

At the same time, grievance is not enough without organization. The Abbasid organizers succeeded because they built a coalition out of populations that did not feel tightly tied to the Umayyad political center. Khurasan mattered specifically because its extreme geographic distance gave organizers room to maneuver outside of immediate imperial control. Its mixed demographic of unhappy Arab settlers and frustrated non-Arab Muslims provided a natural base for a broader movement to take root. Abu Muslim turned this diffuse frustration into a highly coordinated campaign. When he raised the black banners in the oasis city of Merv in 747, his leadership directed regional anger into a disciplined military strategy that began marching westward. In other words, the revolution had a social base, but it also relied on careful regional mobilization to turn anger into an actual political threat.

I understand why someone might argue this was simply a dynastic war between two families fighting for the throne. The military climax at the Battle of the Zab in 750 is often treated as the defining moment of the revolution, and I understand why that framing is attractive. The Umayyad military forces were physically destroyed in that engagement, and the Abbasids took the caliphate by right of conquest shortly afterward. If a reader only looks at the battlefield, the event looks exactly like a standard dynastic takeover. The dynastic claim was clearly the central mechanism for the immediate transfer of power, and the violence of the transition was very real. Even so, reducing the event to that single battle ignores how the Abbasids managed to hold their diverse coalition together in the first place. Military victory explains the immediate collapse of the Umayyads, but it does not explain why the new state looked so different afterward. 

Comparing primary narratives with later analytical writing helps explain how that coalition was actually held together during the fighting. Early historians like al-Tabari focus heavily on moral legitimacy and the appeal of leadership tied to the Prophet's family. As his chronicle shows, Abbasid organizers deliberately mobilized supporters by calling them to follow "the acceptable one from the family of Muhammad." If a reader treats his narrative as simple fact, they miss the way this framing is already doing political work inside the text. Al-Tabari is interested in showing how legitimate authority gathers visible momentum, not in diagnosing provincial tax policy or structural inequality. Later historians help reconstruct the structural conditions, like the jizya and provincial resentment, that made that narrative effective for both eastern Arabs and mawali. One account explains meaning, but the other helps explain mechanism. Reading them together shows how dynastic loyalty gave a fractured social movement a common language.

The geographic choices of the new regime prove that this social reality was institutionalized over the longer term. When the second Abbasid caliph al-Mansur founded Baghdad in 762, it was not just a replacement capital built for administrative security. It was a deliberate eastward shift that moved the empire's center of gravity away from Syria and toward a Persianized cultural sphere. Location produced meaning, and Baghdad sat close to eastern trade routes and populations that had actively supported the revolution. That did not automatically produce a new society, but it meant that the capital itself became evidence that the empire was being imagined differently. The city became a space where administration, trade, and imperial image all reinforced each other. Moving the political center was the first major step in translating the promises of the revolution into a permanent government structure.

This shift becomes even more obvious when looking at how the Abbasids increasingly relied on Persian bureaucratic models. This is best seen in their elevation of the powerful Barmakid family, who were Persian mawali, to the highest levels of government as viziers. Administrative power was no longer a monopoly held by the old Arab conquering elite. It was managed instead as a shared imperial project that required the administrative expertise of the mawali. The scholarly dimension also matters. Up through the reign of al-Ma'mun around 833, the integration of Persian court rituals and massive state sponsorship of scholarly production reinforced the idea that the Abbasids were presiding over a much more cosmopolitan enterprise. The empire was governed differently because the people running the ministries and collecting the revenue were drawn from the groups that the Umayyads had actively excluded. What started as an eastern rebellion became a completely reconfigured administrative state.

So I would argue that the Abbasid Revolution must be understood as a coalition revolution with permanent social effects rather than a simple dynastic transfer. The immediate violence of the dynastic takeover was real, but the century that followed was defined by a massive reconfiguration of power. The new regime dismantled the old Arab aristocracy, resolved the most glaring contradictions of mawali grievance by removing discriminatory taxation, and relocated the heart of the empire to Baghdad. This does not mean the Abbasids created perfect equality in any modern sense. It does mean the revolution fundamentally altered the political and cultural direction of the caliphate. It was not a pure class uprising that erased all hierarchy, but it also was not just one family replacing another while the surrounding society stayed exactly the same. The Abbasid project succeeded because it turned immediate social frustration into a new imperial order.
```

## Level 2 + Sources Essay

```
I do not think the Abbasid Revolution makes sense if it is described only as a dynastic swap or a simple class uprising. That part is obviously true at one level, because one ruling house fell and another took power. But if a reader focuses only on the quick military overthrow between 744 and 750, they miss the actual structural changes that followed over the next century. What stands out to me is that the revolution requires a mixed explanation. The immediate victory worked as a political transfer of power built on broad grievances, but the long-term administrative shifts restructured who actually held prestige. This does not mean the new regime instantly created equality in any modern sense. It does mean the Abbasid era permanently dismantled the Umayyad system of exclusively Arab tribal dominance. If we want to understand the event, we have to weigh the immediate causes of Abbasid victory against the longer social transformations that took place between 744 and 833.

To understand the initial mobilization, it helps to compare how primary and analytical sources explain the early movement. What I find most useful in al-Tabari is not that he gives a perfectly neutral window into the Abbasid Revolution. What he gives instead is evidence for how the movement narrated its own legitimacy. The provided excerpt of al-Tabari describes support gathering in Khurasan under black banners and connects the movement heavily to ambiguous messaging tied to the family of the Prophet. That framing matters because it shows how the Abbasids united different factions without spelling out one exact political program. He is trying to narrate a revolution in a way that makes leadership legible to different groups. Modern historiography offers a different interpretation. The historiographical note provided in the packet argues that the revolution should not be reduced to propaganda or grievance alone, because it depended just as much on Umayyad factional crisis and structural coalition building. I do not think that means one source replaces the other. If al-Tabari highlights the symbolic language that mobilized people, the later historiographical interpretation explains the political conditions that made those symbols effective. Reading them together shows that the revolution relied on opportunistic organizing at the top, but it pulled its momentum from real structural frustration below.

The mechanics of the revolution show why this broader coalition worked in practice. Khurasan mattered specifically because its distance from Damascus gave Abbasid organizers room to operate safely. That geographical advantage gave the movement time to build a base away from the immediate reach of Umayyad power. If Abbasid organizers had announced a strict program prioritizing only Persian non-Arabs, they likely would have alienated the Arab tribesmen who were also angry at the Umayyad capital. Instead, the vague religious legitimacy recorded by al-Tabari gave their overlapping dissatisfactions a common language. Abu Muslim becomes important here not because he single-handedly caused the revolution, but because he managed the coalition. He turned that diffuse regional anger into a coordinated military force. That matters because it proves the revolution was not spontaneous. It had a social base, but it also required disciplined strategy to survive its early years.

Even so, the social grievances fueling that movement cannot be ignored. Some readers might argue that the revolution was essentially a pure class uprising driven by non-Arab converts, and I understand why that explanation is attractive. The frustration was real, but I think it is more accurate to say that the revolution relied on a fragile alliance rather than simply acting as a unified peasant revolt. If it were only a class uprising, it becomes hard to explain why it depended so heavily on Arab military leadership and dynastic claims to succeed. The clearest example of this structural tension surrounds the mawali. Non-Arab converts were theoretically inside the Muslim community. Yet in practice, the lecture packet points out that religious conversion did not erase older hierarchies in taxation, military prestige, and political access. If a supposedly universal Islamic empire continues to treat non-Arab Muslims as second-class subjects, that contradiction is going to become politically dangerous and supply real energy to any rival movement. I would not say mawali frustration caused the revolution all by itself, because the Umayyads were already vulnerable due to their own internal factional crises. As the lecture packet explains, the movement makes more sense as "a coalition of grievances rather than a single class uprising." The mawali question matters deeply, but it only produced victory because it was joined to eastern military organization and Umayyad weakness.

The immediate result of this coalition was a conventional military conquest. When the organized eastern army finally broke Umayyad control at the Battle of the Zab in 750, it secured the dynastic transfer of power. The seminar notes on the campaign stress that this decisive military defeat mattered because earlier political anger had finally been turned into coordinated force. The battle ended Umayyad control in the central caliphate and allowed the Abbasids to physically replace the old ruling family. If someone wanted to argue that the Abbasid Revolution was just a palace takeover, this immediate military victory is their strongest evidence. The ruling house changed through violence, just like in any other dynastic swap. But if that is the whole explanation, it becomes hard to explain why the new regime changed the political center of the empire so dramatically afterward. The military victory at the Zab was the immediate mechanism, but it was not the final outcome of the revolution.

What makes the event a genuine social revolution, though, is what happened after the initial conquest. The foundation of Baghdad in 762 under al-Mansur is the clearest evidence for this long-term reconfiguration. Location mattered. Because the new capital was tied directly to eastern trade routes and Persian administrative culture, it physically shifted the empire's center of gravity away from the old Arab elite in Syria. At the same time, the early Abbasid government expanded the role of Persian secretaries and viziers in its daily administration. They relied more visibly on Persian administrative practice instead of simply copying the Umayyad system. This gave new groups direct control over revenue, movement, and communication. The seminar discussion frames this as evidence that the revolution changed the empire's center of gravity, not merely its ruling family. This does not mean the Abbasids stopped being an elitist, dynastic state. It does mean the practical social hierarchy of the empire was structurally reconfigured to include groups that the Umayyads had previously marginalized. The capital itself became evidence that the empire was being imagined differently.

So I would argue that the Abbasid Revolution was a coalition revolution with deep social effects. It was not a pure class uprising. It obviously relied on conventional military force and vague slogans in its early stages. Those immediate mechanics mattered. But treating the event simply as one family replacing another ignores the reality of what Baghdad and the new administration actually did. If we evaluate the revolution by its long-term consequences between 744 and 833, the integration of non-Arab elites proves that it forced a major social reconfiguration. The historiographical note argues that the revolution was social in effect even if it was not socially uniform in origin, because it restructured who could matter within the empire. I think that is the most accurate view. The revolution changed the system. That is what makes it more than a palace takeover.
```
