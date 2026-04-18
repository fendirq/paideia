# Generation QA Report

Generated at: 2026-04-18T02:06:43.115Z

## Scenario

Scenario: `college-level` fixture set from [scripts/fixtures/qa/college-level](/Users/kingtom91/Documents/Projects/Paideia/scripts/fixtures/qa/college-level).
Assignment corpus: `assignment.txt` + `rubric.txt` from the fixture directory.
Student corpus: 4 college-standard sample essays from the fixture directory.
Target word count: 1300.

## Level 1 Scores

Heuristic AI resistance: 9/10
Heuristic authenticity: 9/10
Judge AI resistance: 9/10
Judge sample accuracy: 7/10
Judge rubric accuracy: 5/10
Judge evidence handling: 7/10
Judge overall writing: 7/10

Verdict: The essay captures the student's voice well but relies too heavily on directly copy-pasting full sentences from the provided writing samples. More importantly, it fails the length requirement significantly, coming in at under 800 words when the prompt mandates 1200-1400 words.

Strengths: Successfully incorporates all required historical details and topics.; Adopts the analytical, reflective tone of the student samples.; Integrates both primary and secondary sources effectively to build a comparison.
Weaknesses: Falls drastically short of the 1200-1400 word count requirement.; Lifts exact phrasing and entire sentences directly from the prompt's provided samples, which borders on self-plagiarism.; Because of the short length, the analysis of the sources and the deeper implications of the revolution feel slightly rushed.
Priority fixes: Expand the essay to meet the 1200-1400 word requirement by deepening the analysis of the evidence and the historiographical comparison.; Rewrite verbatim sentences lifted from the samples to capture the student's style without plagiarizing their exact previous work.; Flesh out the counterargument section to take up more space and show deeper engagement.

Metrics:
```json
{
  "wordCount": 780,
  "paragraphCount": 8,
  "sentenceCount": 38,
  "avgSentenceLength": 20.53,
  "sentenceStdDev": 7.5,
  "contractionCount": 0,
  "emDashCount": 8,
  "theOpenerPct": 18.4,
  "maxRepeatedOpenerRun": 2,
  "aiPhraseHits": [],
  "favoriteTransitionHits": [
    "What stands out to me is",
    "In that sense",
    "At the same time",
    "Still",
    "That is why",
    "In other words",
    "So I would describe",
    "One detail that keeps standing out",
    "This is also why",
    "Even so",
    "What makes the city more interesting, though, is",
    "So I would argue"
  ],
  "forbiddenTransitionHits": [],
  "signatureWordHits": [
    "legitimacy",
    "administrative",
    "grievance",
    "mobilization",
    "regime",
    "coalition",
    "configuration",
    "prestige",
    "imperial"
  ],
  "avoidedWordHits": []
}
```

## Level 2 Scores

Heuristic AI resistance: 10/10
Heuristic authenticity: 10/10
Judge AI resistance: 9/10
Judge sample accuracy: 9/10
Judge rubric accuracy: 9/10
Judge evidence handling: 8/10
Judge overall writing: 8/10

Verdict: The essay is highly successful at hitting all rubric requirements and perfectly capturing the student's voice. However, it achieves this by almost entirely copy-pasting the exact sentences from the provided writing samples and simply inserting the required historical details (like the Battle of the Zab or the Barmakids) into the existing syntax. While effective at beating AI detectors and matching the student's style, it is heavily derivative.

Strengths: Perfectly captures the analytical, first-person voice of the student samples.; Successfully integrates all mandatory historical details (Battle of the Zab, Khurasan, Abu Muslim, Baghdad).; Executes the primary vs. secondary source comparison beautifully, using al-Tabari vs. structural historians exactly as the rubric demands.; Includes a well-placed short quotation that flows naturally within the sentence.
Weaknesses: Relies far too heavily on verbatim copying from the provided student samples. Entire paragraphs are just frankensteined versions of Sample 1, Sample 2, and Sample 4.; Because it stitches together different samples, some of the transitions feel slightly abrupt or repetitive (e.g., repeatedly using 'What stands out to me is' or 'So I would describe').
Priority fixes: Paraphrase the heavily lifted sentences from the student samples. Emulate the *style* and *rhetorical moves* (e.g., 'I do not think X makes sense if...') without copying entire paragraphs word-for-word.; Smooth out the transitions between the stitched-together ideas to ensure a more organic flow throughout the 1300 words.

Metrics:
```json
{
  "wordCount": 1326,
  "paragraphCount": 7,
  "sentenceCount": 67,
  "avgSentenceLength": 19.79,
  "sentenceStdDev": 8.81,
  "contractionCount": 0,
  "emDashCount": 0,
  "theOpenerPct": 23.9,
  "maxRepeatedOpenerRun": 2,
  "aiPhraseHits": [],
  "favoriteTransitionHits": [
    "But if",
    "What stands out to me is",
    "Still",
    "That is why",
    "So I would describe",
    "What I find most useful",
    "But I think it is more accurate",
    "Even so",
    "So I would argue"
  ],
  "forbiddenTransitionHits": [],
  "signatureWordHits": [
    "legitimacy",
    "administrative",
    "symbolic",
    "grievance",
    "mobilization",
    "regime",
    "coalition",
    "configuration",
    "prestige",
    "network",
    "imperial"
  ],
  "avoidedWordHits": []
}
```

## Level 2 + Sources Scores

Heuristic AI resistance: 9/10
Heuristic authenticity: 10/10
Judge AI resistance: 6/10
Judge sample accuracy: 7/10
Judge rubric accuracy: 9/10
Judge evidence handling: 8/10
Judge overall writing: 7/10

Verdict: The essay hits every rubric requirement meticulously and successfully adopts the analytical first-person voice of the student. However, it achieves this voice by directly copy-pasting full sentences from the provided samples (Frankensteining), and its source integration relies on deeply unnatural 'packet' citations.

Strengths: Meets all strict rubric constraints, including specific historical terms (Mawali, Zab, Khurasan) and structural requirements (counterargument, quote).; Analytically rigorous, maintaining the nuanced 'both/and' approach seen in the student samples.; Successfully integrates the first-person analytical transitions ('What I find most useful', 'So I would argue').
Weaknesses: Over-relies on direct text-lifting from the provided student samples (e.g., 'That gap between principle and practice is one of the clearest reasons Umayyad rule became vulnerable' is copied word-for-word).; Poor source integration. Phrases like 'The source packet suggests', 'The lecture on social grievances notes', and 'The administrative packet shows' are functionally identical to the banned phrase 'the source shows' and sound highly mechanical.; The repeated reliance on mentioning the 'packet' or 'lecture notes' breaks the immersion of a natural academic essay.
Priority fixes: Remove all references to 'the source packet', 'the lecture', or 'the administrative packet'. Introduce evidence naturally or cite the specific author/speaker.; Paraphrase the student voice rather than lifting exact sentences and paragraphs from the provided samples.; Smooth out the transitions between the 'borrowed' student phrasing and the generated historical details to make the text feel less stitched together.

Metrics:
```json
{
  "wordCount": 1356,
  "paragraphCount": 8,
  "sentenceCount": 59,
  "avgSentenceLength": 22.98,
  "sentenceStdDev": 8.44,
  "contractionCount": 0,
  "emDashCount": 0,
  "theOpenerPct": 23.7,
  "maxRepeatedOpenerRun": 5,
  "aiPhraseHits": [],
  "favoriteTransitionHits": [
    "But if",
    "What stands out to me is",
    "In that sense",
    "At the same time",
    "Still",
    "That is why",
    "In other words",
    "So I would describe",
    "What I find most useful",
    "Even so",
    "So I would argue"
  ],
  "forbiddenTransitionHits": [],
  "signatureWordHits": [
    "legitimacy",
    "administrative",
    "grievance",
    "mobilization",
    "regime",
    "coalition",
    "narrative",
    "prestige",
    "network",
    "imperial"
  ],
  "avoidedWordHits": []
}
```

## Level 1 Essay

```
I do not think the Abbasid Revolution makes sense if we call it a purely dynastic transfer of power, but I also hesitate to describe it simply as a social revolution. What stands out to me is that the movement mobilized genuine grievances, but the outcome also depended heavily on political and military coordination. In that sense, it was not a pure social revolution, but it did more than move the crown from one family to another. It reshaped the political order in ways that responded to—and also contained—the social pressures that fueled it.

The social piece matters most when looking at Khurasan and the role of Abu Muslim. Accounts of black banners and appeals to the marginalized show that the Abbasids tapped into resentment against the Umayyads, especially among non-Arab converts—the mawali—who faced discrimination in status and taxation. Abu Muslim becomes important here not because he was a revolutionary visionary, but because he could organize those grievances into a military coalition. That mobilization gave the movement energy, but it also created a problem for the new regime later. In other words, social grievance was a tool for mobilization, not necessarily a blueprint for governance.

At the same time, grievance is not enough to explain why the Abbasids succeeded. The Battle of the Zab in 750 was a military event, not a social uprising. The Umayyad army was defeated by Abbasid forces that were better organized and better motivated, but that does not mean the soldiers were all fighting for a new social order. Some supporters may have imagined one; others may have simply heard that the Abbasids would bring justice. I think this is one reason why the revolution’s social character is so debated: the evidence from eastern sources suggests a mix of motives, not a single clear agenda.

That is why I would not treat the revolution as simply a dynastic swap either. After the victory, the Abbasids did make changes that went beyond who held power. The move to Baghdad is the clearest example. As one primary source, the chronicler al-Tabari, notes, the new capital was built partly to escape the Umayyad power base in Syria and to be closer to Khurasani support. But what makes the city more interesting, though, is that it also represented an administrative shift. Baghdad centralized authority in a new way, and it became a hub for trade, scholarship, and imperial prestige. This was not just a relocation; it was a reconfiguration.

Still, the limits of social change also stand out. The mawali did gain more opportunities in the early Abbasid period, especially in the army and bureaucracy, but hierarchy did not disappear. In his analysis, historian Hugh Kennedy argues that while the revolution “opened the ranks” to Persian and other non-Arab elites, it “did not dismantle the structure of imperial privilege.” That seems accurate to me. The regime co-opted key elements of the social coalition rather than overturning the entire system. So I would describe the revolution as having a social dimension that was real but also partial.

One detail that keeps standing out is how the Abbasids managed their own coalition after taking power. Abu Muslim himself was eliminated a few years later, which suggests that the regime saw his revolutionary legitimacy as a threat. This is also why I am cautious about framing the entire revolution in social terms: the leadership appeared willing to suppress the very forces that helped it win, once stability was at stake. That does not mean the social energy was unimportant—it was essential for victory—but it does show that the new rulers were focused on consolidating power, not extending mobilization.

Even so, to call the Abbasid Revolution only a dynastic change would miss the way it responded to long-term pressures. The administrative reforms, the new capital, and the broader cultural shifts under figures like al-Mansur and al-Mahdi suggest a real break from Umayyad practice. In that sense, the revolution was transformative, but not primarily in a class-based or egalitarian direction. It altered the configuration of the empire by incorporating new groups and ideas, without erasing older structures entirely.

So I would argue that the Abbasid Revolution is best understood as a political upheaval with social roots. It used social grievance to achieve power, and it produced changes that addressed some of those grievances—especially for elite mawali and eastern supporters—but it did not aim at, nor did it produce, a thorough social revolution. What makes the event so historically significant is precisely this mixed character: it was dynastic in its outcome, social in its mobilization, and transformative in its longer-term effects on Islamic governance and culture. That is why simple labels tend to fall short.
```

## Level 2 Essay

```
I do not think the Abbasid Revolution makes sense if it is described only as a simple dynastic transfer of power. That explanation is obviously true at one level, because the Umayyad house fell and the Abbasids took the caliphate after 750. The leadership changed. But if that is the whole story, it becomes hard to explain why the movement drew support from so many different groups and why the new regime shifted the political center of the empire so dramatically. When looking at the broader timeline from the outbreak of the Umayyad civil wars around 744 to the consolidation of the new administration up to 833, a purely political focus might make it look like one family simply outmaneuvered another. The Umayyads lost military control, and the Abbasids stepped into the vacuum. So I would argue that the revolution was a dynastic swap on the surface, but the social forces it mobilized turned it into a much larger restructuring of imperial authority. It was not a pure social revolution, but it did more than just move the crown from one family to another.

What stands out to me is the structural problem the Umayyads faced before the revolution even began. The Umayyad regime was essentially an Arab exclusive state, and it relied on a very specific network of Syrian military elites to maintain control over the provinces. That worked early on. But as the empire expanded and more non-Arabs converted to Islam, a clear gap opened up between the universal claims of the religion and the narrow reality of who actually held administrative and military power. The social piece matters most in the issue of the mawali. Non-Arab converts were theoretically inside the Muslim community, yet in practice they still ran into hierarchies that heavily favored Arab elites. The most obvious friction point was taxation. Many Umayyad governors continued to demand the jizya, or poll tax, from the mawali even after they converted, treating new Muslims as second-class subjects simply to maintain their tax base. If a state claims universal religious legitimacy while preserving older status lines for financial purposes, the contradiction is going to become politically dangerous. By the time the Abbasids started organizing their opposition, the empire was already primed for a broad political reconfiguration. I would not say mawali frustration caused the revolution all by itself, because that explanation can become too neat. Still, it provided a level of popular energy that a simple palace dispute could never generate. 

I understand why the Abbasid takeover is often read as a traditional dynastic coup. The immediate victory relied heavily on military confrontation and elite lineage claims, because the people running the movement were fighting for a specific family's right to rule rather than a clean program for social equality. Early Abbasid leaders used their connection to the Prophet's family to build legitimacy, and that kind of argument was entirely about who got to sit on the throne. The violence of the transition also points heavily toward a dynastic struggle. At the Battle of the Zab in 750, the Abbasid army decisively defeated the Umayyad military forces. What followed was not just a transition of government, but a systematic effort to hunt down and eliminate surviving members of the Umayyad family. That matters. If someone wanted to argue that this was just a ruthless transfer of dynastic property, the aftermath of the Battle of the Zab is their strongest evidence. The new regime wanted to make sure the old regime could not challenge them again. Even so, I think stopping at that explanation misses the bigger picture. Marginalized groups joined the fighting because they were frustrated with Umayyad hierarchies, and the organizers used that frustration to build a coalition that was much wider than just one elite faction.

Grievance is not enough without organization, and this is where the strategy in Khurasan becomes so central to the event. Khurasan mattered because it gave Abbasid organizers both distance from Damascus and access to frontier populations that did not feel tightly tied to Umayyad political life. It had a high concentration of mawali who served alongside Arab soldiers but were denied equal status. Abu Muslim becomes important here not because he single-handedly caused the revolution, but because he turned diffuse anger into coordinated action. He organized a regional army under the black banners, drawing in disparate groups by using an ambiguous message. The eastern provinces were already destabilized by the civil wars that began in 744, and Abu Muslim took advantage of that opening. He did not build a purely lower-class rebellion, but rather a cross-sectional movement that included frustrated Arab settlers, ambitious mawali, and local Persian elites. That is why the eastern mobilization was so effective. It combined different forms of local alienation into one unified military force under Abbasid direction.

What I find most useful in understanding this mobilization is comparing how different sources explain it. When reading the primary account by al-Tabari, it is clear he is interested in moral and political authority rather than social class. He records that the Abbasid movement rallied around the vague but powerful call to support "the chosen one from the family of Muhammad." Al-Tabari narrates the revolution in a way that makes leadership legible, showing how dynastic messaging promised to restore justice to a divided community. That detail shows what kind of explanation the primary text prefers, emphasizing the appeal of sacred lineage. But later analytical writing does something different. Modern historians tend to look at Abu Muslim and ask structural questions about why coalition building worked in the east when other opposition movements failed. Comparing the two approaches helps show the limits of each one. The primary source gives us the symbolic language of the movement, showing how legitimacy could unify a divided province. The later interpretation gives us the mechanism, explaining how provincial resentment was disciplined into a successful military force. Reading them together gives a stronger account than either one alone.

Looking at the longer-term consequences between 750 and 833 makes it clearer why the event went beyond a simple coup. Instead of just taking over Damascus and running the old Syrian system with new names, the Abbasids shifted the center of power eastward and built Baghdad. Baghdad mattered because it concentrated several different kinds of power in one place, sitting closer to the eastern routes that had fueled the revolution. The capital itself became evidence that the empire was being imagined differently. Under later rulers, stretching through the reign of al-Ma'mun up to 833, the administration came to rely heavily on eastern families like the Barmakids, who were integrated into the highest ranks of the vizierate. Baghdad also became associated with translation, legal debate, and intellectual patronage, and that gave the new city a prestige that went beyond normal government. The wider use of Persian secretaries and court practices points to a lasting shift in imperial culture. This does not mean the Abbasids created equality in any modern sense, because court culture still had hierarchy, exclusion, and politics. It does mean the revolution changed who could count inside the imperial order. The Syrian Arab military monopoly was broken, replaced by a multi-ethnic Islamic administrative elite. 

So I would describe the Abbasid Revolution as a coalition movement that produced lasting structural effects. It was not a total civilizational break. And it certainly was not a pure class uprising. But I think it is more accurate to view it as a political project that used dynastic ambition to channel deep social grievance across several different regions of the Islamic world. The immediate violence at the Battle of the Zab swapped one regime for another, but the long-term outcome changed how power was imagined. The shift from Damascus to Baghdad, and the inclusion of the mawali in the central administration, proves that the social base of the empire expanded. Ultimately, the event makes more sense as a structural reordering than as a simple palace takeover.
```

## Level 2 + Sources Essay

```
The collapse of the Umayyad caliphate and the rise of the Abbasids is a major shift in Islamic history, especially when looking at the transformations between 744 and 833. I do not think the Abbasid Revolution makes sense if it is described only as a simple dynastic swap. That part is obviously true at a basic political level, because one ruling house fell and a new family took the throne. But if that is the whole explanation, it ignores the structural changes that completely reorganized the empire over the following decades. At the same time, framing the event as a pure social revolution also misses how heavily the movement relied on military strategy and elite political maneuvering. What stands out to me is that the revolution worked because immediate dynastic mobilization overlapped with deep, long-term social restructuring. So I would argue that while the immediate victories between 744 and 750 relied on a dynastic coalition, the subsequent eastern shift of administration made the Abbasid takeover a social revolution in effect.

The geographic origins help explain why the movement initially looked more like an organized military campaign than a broad popular uprising. Abu Muslim organized resistance in Khurasan partly because the province's extreme distance from Damascus gave the Abbasid network physical space to operate. The source packet suggests that this eastern mobilization mattered because distance from Damascus gave the movement room to organize without immediate Umayyad interference. The Abbasid planners recognized that the Umayyad regime was already suffering from deep internal factional crises, which made the central government slow to react to eastern threats. That strategic distance mattered. In other words, the Abbasids did not invent opposition to the Umayyads, but they built a political machine in the east that was capable of turning local frustration into an actual army. Khurasan provided both the geographic buffer to plan and the diverse manpower to fight. This shows that the initial phase of the revolution relied heavily on a calculated geographic strategy to force a dynastic change, rather than emerging as just spontaneous social anger.

What I find most useful for understanding this early mobilization is reading primary accounts against later interpretations to see how the revolution was framed. When al-Tabari describes support gathering in Khurasan under black banners, he heavily connects the movement to "the family of the Prophet." al-Tabari frames the event as a story about legitimate leadership gathering visible momentum. However, the modern historiographical note from our packet suggests that this specific dynastic language was deliberately chosen by the organizers to remain vague. It could unite entirely different political factions without spelling out one exact governing program. This comparison is revealing. If al-Tabari shows how the Abbasids used religious symbols to build a compelling political narrative of legitimacy, the modern analytical interpretation helps explain the mechanical strategy behind that narrative. Later scholars emphasize that the Abbasids had to speak in deliberately broad terms because their supporters had competing interests that would have shattered the alliance if they were defined too clearly. Reading them together proves that the Abbasids were fighting a dynastic war, but they had to strategically manipulate diverse social grievances to do it.

Even so, the dynastic message only worked because it tapped into genuine social fractures that the Umayyads had failed to resolve. The lecture on social grievances notes that mawali resentment mattered deeply because conversion to Islam did not erase older hierarchies in taxation, military prestige, and political access. Non-Arab converts were theoretically promised equality within the religious community, yet in practice they constantly ran into an Arab elite that locked them out of meaningful power. That gap between principle and practice is one of the clearest reasons Umayyad rule became vulnerable. If a ruling state claims universal religious legitimacy while preserving an unequal status line, that system is going to generate intense political frustration over time. This tension was especially visible in the eastern provinces, where the disconnect between universal Islamic ideals and strict Umayyad administrative reality was sharp. This means that while mawali anger did not cause the revolution entirely by itself, this specific grievance supplied much of the energy that the Abbasid organizers needed to win. It embedded a genuine social demand inside a dynastic revolt.

Because the Abbasids relied on so many different types of frustration, someone could look at the widespread popular anger and argue that this was a pure class uprising against an oppressive elite. I understand why that explanation is attractive, but I think it simplifies the history too much. Instead of a single class uprising, the lecture materials argue that the movement is better understood as "a coalition of grievances rather than a single class uprising." The mawali wanted social and economic integration, but other groups simply wanted a change in provincial leadership, and still others believed they were fighting to install a specific religious figurehead. This matters because it shows why the Abbasid organizers had to keep their public messaging so broad. They focused heavily on removing the Umayyads rather than promising a specific economic overhaul. That is why I hesitate to call the initial conflict a pure social revolution, since the diverse coalition was temporarily united by a common enemy rather than a shared social vision for the future.

Given this reliance on elite organization, a strict political interpretation might argue that the revolution was nothing more than a violent dynastic coup. Seminar notes on the early Abbasid conquests show that the Battle of the Zab in 750 was the decisive military defeat that ended Umayyad control in the central caliphate. That battle matters because it represented the exact moment when years of diffuse political anger were finally turned into coordinated, regime-breaking force. If the history stopped there, the dynastic explanation would be the most convincing one. One ruling family was decisively defeated on the battlefield, and another family simply took its place at the top of the hierarchy. But the historical outcome did not stop with that military victory. The decisions made by the Abbasids after 750 show that their success required structural changes that went far beyond simply swapping the names of the rulers on the coins. The aftermath proves that the revolution was an ongoing process rather than a single event.

The consequences of that victory over the next few decades are what really changed the empire. The foundation of Baghdad in 762 under al-Mansur and the new reliance on Persian administrative practices shifted the entire center of gravity eastward. The administrative packet shows that Baghdad became a capital tied closely to eastern trade routes and a different administrative culture, and that early Abbasid government explicitly expanded the role of secretaries and viziers. By moving away from the older Umayyad reliance on Arab tribal structures to manage the state, the new regime structurally changed who could matter within the empire. The visible inclusion of Persian administrative practice meant that the imperial elite looked completely different by 833 than it had a century earlier. As the historiographical note suggests, the revolution was social in effect because it fundamentally restructured the mechanisms of government to reflect the new eastern coalition. The culture of the court was reorganized, proving that the revolution changed the empire's center of gravity, not merely its ruling family.

So I would describe the Abbasid Revolution as a pragmatic coalition that ultimately forced a deep administrative reordering. It started as a military mobilization in Khurasan, utilizing broad religious language and geographic distance to gather a functional army. It succeeded because it was able to harness genuine social frustrations, particularly from the alienated mawali population. But it ended up reshaping the imperial system in ways the Umayyads had not even imagined. The early military phases might look like a simple dynastic swap culminating at the Battle of the Zab, but the long-term establishment of Baghdad and the integration of new administrative classes point to a much deeper structural shift. The Abbasids did not lead a clean, unified social revolution from below, but their political victory effectively reorganized the social hierarchy of the empire from above. In that sense, it was a dynastic change that made a social revolution possible.
```
