# Generation QA Report

Generated at: 2026-04-14T01:07:13.344Z

## Scenario

Scenario: `college-level` fixture set from [scripts/fixtures/qa/college-level](/Users/kingtom91/Documents/Projects/Paideia/scripts/fixtures/qa/college-level).
Assignment corpus: `assignment.txt` + `rubric.txt` from the fixture directory.
Student corpus: 4 college-standard sample essays from the fixture directory.
Target word count: 1300.

## Level 1 Scores

Heuristic AI resistance: 5/10
Heuristic authenticity: 9/10
Judge AI resistance: 4/10
Judge sample accuracy: 6/10
Judge rubric accuracy: 4/10
Judge evidence handling: 5/10
Judge academic quality: 6/10
Judge overall writing: 5/10

Verdict: This essay demonstrates solid analytical thinking and addresses the core question, but falls short of the assignment requirements in several critical ways. While it engages meaningfully with the social vs. dynastic debate and shows understanding of key concepts like mawali grievances and Abu Muslim's role, it lacks the required source citations, quotations, and explicit primary/secondary source comparison. The writing style is competent but relies too heavily on AI-typical transitions and lacks the distinctive voice patterns seen in the student samples.

Strengths: Clear thesis that takes a nuanced position on the social vs. dynastic question; Good integration of key historical concepts (mawali, Abu Muslim, Battle of the Zab, Baghdad); Logical paragraph structure that builds an argument rather than just listing facts; Demonstrates understanding of both immediate causes and longer-term consequences
Weaknesses: Missing required quotations from source packet entirely; No explicit comparison between primary and secondary sources as required; Vague source attribution ('Al-Tabari's account' without specific citation); Falls short of minimum word count (941 vs. 1200-1400 required); Overuses AI-typical transition phrases ('At the same time,' 'In other words,' 'That is why'); Lacks the distinctive analytical voice and specific evidence handling seen in student samples
Priority fixes: Add specific quotations from the source packet with proper attribution; Include explicit comparison between a primary source perspective and later analytical interpretation; Expand to meet minimum word count while adding more specific historical evidence; Reduce reliance on formulaic transitions and develop more natural voice patterns; Add a substantive counterargument section as required by the rubric

Metrics:
```json
{
  "wordCount": 941,
  "paragraphCount": 8,
  "sentenceCount": 50,
  "avgSentenceLength": 18.82,
  "sentenceStdDev": 6.02,
  "contractionCount": 0,
  "emDashCount": 8,
  "theOpenerPct": 28,
  "maxRepeatedOpenerRun": 2,
  "aiPhraseHits": [
    "pivotal"
  ],
  "favoriteTransitionHits": [
    "At the same time",
    "In other words",
    "That is why",
    "Even so",
    "Still",
    "So I would",
    "But",
    "What stands out",
    "This is also why",
    "In that sense",
    "What makes",
    "The comparison with"
  ],
  "forbiddenTransitionHits": [],
  "signatureWordHits": [
    "matter",
    "mattered",
    "matters",
    "political",
    "power",
    "authority",
    "legitimacy",
    "empire",
    "revolution",
    "movement",
    "order",
    "structure",
    "evidence",
    "narrative",
    "configuration",
    "administration",
    "grievance"
  ],
  "avoidedWordHits": []
}
```

## Level 2 Scores

Heuristic AI resistance: 9/10
Heuristic authenticity: 10/10
Judge AI resistance: 8/10
Judge sample accuracy: 9/10
Judge rubric accuracy: 9/10
Judge evidence handling: 8/10
Judge academic quality: 8/10
Judge overall writing: 8/10

Verdict: This is a strong essay that successfully mimics the student's analytical voice and meets most rubric requirements. The thesis is clear and arguable, the evidence is well-integrated, and the writing demonstrates genuine historical thinking. The comparison between al-Tabari and later analytical approaches is particularly effective. However, the essay occasionally becomes dense and could benefit from clearer paragraph breaks and more explicit counterargument engagement.

Strengths: Clear, nuanced thesis that distinguishes between immediate causes and longer-term consequences; Effective integration of required elements (Abu Muslim, Khurasan, mawali, Battle of Zab, Baghdad); Strong comparison between primary source (al-Tabari) and analytical interpretation; Good use of specific evidence like the Barmakids and Baghdad's round city plan; Authentic student voice that matches the samples' analytical style and vocabulary patterns
Weaknesses: Some paragraphs are overly long and could be broken up for better flow; The counterargument about dynastic character could be more explicitly structured; Occasional density that makes some sentences harder to follow; Could use more explicit transitions between major points; The al-Tabari quotation integration feels slightly forced
Priority fixes: Break the second paragraph into two separate paragraphs for better organization; Make the counterargument more explicit with clearer signposting; Simplify some of the longer, more complex sentences for better readability

Metrics:
```json
{
  "wordCount": 1360,
  "paragraphCount": 6,
  "sentenceCount": 58,
  "avgSentenceLength": 23.45,
  "sentenceStdDev": 11.67,
  "contractionCount": 0,
  "emDashCount": 0,
  "theOpenerPct": 27.6,
  "maxRepeatedOpenerRun": 4,
  "aiPhraseHits": [],
  "favoriteTransitionHits": [
    "At the same time",
    "Still",
    "So I would",
    "But",
    "What stands out",
    "In that sense"
  ],
  "forbiddenTransitionHits": [],
  "signatureWordHits": [
    "matter",
    "mattered",
    "matters",
    "political",
    "power",
    "authority",
    "legitimacy",
    "empire",
    "revolution",
    "movement",
    "order",
    "structure",
    "evidence",
    "narrative",
    "symbolic",
    "grievance"
  ],
  "avoidedWordHits": []
}
```

## Level 2 + Sources Scores

Heuristic AI resistance: 9/10
Heuristic authenticity: 10/10
Judge AI resistance: 8/10
Judge sample accuracy: 7/10
Judge rubric accuracy: 9/10
Judge evidence handling: 8/10
Judge academic quality: 8/10
Judge overall writing: 8/10

Verdict: This is a strong analytical essay that successfully addresses the prompt with sophisticated argumentation and good evidence handling. The writing demonstrates the analytical depth and interpretive complexity found in the student samples, though it occasionally feels slightly more polished and systematic than the authentic student voice. The essay effectively distinguishes between immediate causes and long-term consequences while building a nuanced argument about coalition politics and social transformation.

Strengths: Clear, sophisticated thesis that avoids false binaries and sets up a nuanced argument; Strong evidence integration with specific historical details (Abu Muslim, Khurasan, Battle of Zab, Baghdad); Effective handling of primary vs. secondary source comparison with al-Tabari; Good counterargument section that takes dynastic transfer seriously; Analytical rather than descriptive approach throughout; Meets all rubric requirements including word count and required elements
Weaknesses: Slightly more systematic and polished than authentic student writing samples; Some transitions feel more formulaic than the organic flow in real samples; Occasional over-explanation that real students might leave more implicit; The conclusion feels slightly too neat compared to student samples' more open-ended approaches; Missing some of the more personal interpretive voice found in authentic samples
Priority fixes: Add more interpretive uncertainty and personal reasoning like 'What stands out to me' or 'I think this is one reason'; Make some transitions less smooth and more abrupt to match student writing patterns; Include more direct engagement with why evidence matters for the interpretation rather than just what it shows; Add occasional hedging or acknowledgment of interpretive limits

Metrics:
```json
{
  "wordCount": 1266,
  "paragraphCount": 7,
  "sentenceCount": 62,
  "avgSentenceLength": 20.42,
  "sentenceStdDev": 9.5,
  "contractionCount": 0,
  "emDashCount": 0,
  "theOpenerPct": 30.6,
  "maxRepeatedOpenerRun": 5,
  "aiPhraseHits": [],
  "favoriteTransitionHits": [
    "At the same time",
    "Even so",
    "Still",
    "But",
    "What makes"
  ],
  "forbiddenTransitionHits": [],
  "signatureWordHits": [
    "matter",
    "mattered",
    "matters",
    "political",
    "power",
    "authority",
    "legitimacy",
    "empire",
    "revolution",
    "movement",
    "order",
    "structure",
    "evidence",
    "narrative",
    "grievance"
  ],
  "avoidedWordHits": []
}
```

## Level 1 Essay

```
I do not think the Abbasid Revolution can be understood simply as a dynastic transfer of power, even though the shift from Umayyad to Abbasid authority was clearly a central outcome. What stands out is the degree to which deep social grievances, especially among non-Arab converts and newly Islamized populations, shaped the movement from its origins. That is not to dismiss the political ambition of the Abbasid family or the military skill of commanders like Abu Muslim. But the social piece matters because it explains both the breadth of the movement and the kinds of changes that followed long after the Battle of the Zab. So I would describe the Abbasid Revolution as a dynastic change that acted upon and was propelled by social transformation, making the revolution both political in its immediate outcome and social in its longer-term implications.

The dynastic claim was certainly part of the Abbasid appeal, especially the argument that leadership should return to the family of the Prophet. Al-Tabari’s account emphasizes that the early Abbasid propagandists framed their cause in exactly those terms, invoking the legitimacy of Muhammad’s lineage. In that sense, the movement presented itself as a restoration of rightful authority, not just a rebellion. Still, I think this narrative alone does not account for the widespread support the Abbasids received, particularly in regions like Khurasan. The dynastic argument resonated partly because it aligned with social grievances that were already present. That matters because it suggests the Abbasids were not merely imposing a new dynasty from the top down—they were channeling existing discontent.

What makes the revolution more than dynastic is the evidence of deep social unrest, especially among the mawali. These non-Arab converts to Islam often faced discrimination under the Umayyads, both in taxation and social status, despite their conversion. Abu Muslim’s ability to mobilize support in Khurasan illustrates this clearly. He did not simply recruit soldiers; he appealed to those who felt excluded from the existing political order. The sources indicate that his message emphasized justice and inclusion, promising a more equitable administration. This is also why I hesitate to see the revolution as purely dynastic. The mawali were not fighting primarily for the Abbasid family; they were fighting against Umayyad social hierarchy. That is why the movement gained such momentum—it addressed a structural grievance, not just a leadership dispute.

At the same time, the military victory itself—especially at the Battle of the Zab in 750—was a critical moment of dynastic transition. The battle effectively ended Umayyad resistance and cleared the way for Abbasid authority. I understand why some historians focus on this as evidence of a primarily political revolution. If the outcome had been only a change in rulers, with no deeper shifts in administration or social structure, then the dynastic interpretation would be stronger. Even so, what followed suggests the revolution was more than that. The Abbasids did not just replace Umayyad officials; they altered the configuration of the empire’s political and social order.

The comparison with earlier periods makes this especially clear. Under the Umayyads, authority had been concentrated among a narrow Arab elite, often with tribal and regional loyalties shaping administration. After the revolution, the Abbasids built a more centralized, bureaucratic state that relied less on tribal affiliation and more on administrative competence. The founding of Baghdad is a powerful symbol of this shift. The city was not just a new capital; it represented a new theory of empire. Its location, its multi-ethnic population, and its role as a center of trade and scholarship all signaled a break from the Umayyad model. In other words, the revolution enabled a transformation in how power was organized and legitimized.

That transformation also had a clear social dimension. The status of mawali improved in the early Abbasid period, not uniformly or perfectly, but significantly. They gained greater access to political office, military command, and scholarly networks. This is not something a purely dynastic revolution would necessarily produce. It mattered because it reflected the promises made during the rebellion. When Abu Muslim told his followers that the new order would be more just, he was articulating a social vision, not just a political one. The administration’s later reliance on Persian bureaucrats and officials from diverse backgrounds shows that the revolution had opened paths to power that the Umayyads had kept closed.

Still, I would not say the revolution was entirely social in its causes or consequences. Some of the changes were pragmatic—adjustments to governing a vast, diverse empire—rather than ideological. The Abbasids still relied on military power and dynastic legitimacy to maintain control. They suppressed some of their own early supporters, including Abu Muslim, when those allies became threats to their authority. That suggests a tension between the social ideals of the movement and the political realities of rule. In that sense, the revolution contained both social and dynastic elements, and they were often in conflict after the victory was won.

So I would argue that the Abbasid Revolution is best understood as an event that was dynastic in its mechanism but social in its origins and long-term effects. The immediate cause was the seizure of power by a new ruling family, and the Battle of the Zab was the decisive moment in that transfer. But the movement’s breadth and the changes that followed—administrative centralization, the improved status of mawali, the founding of Baghdad—all point to deeper social forces at work. The revolution did not just change who ruled; it changed how the empire was conceived and organized. That is why it remains such a pivotal moment, not only in Islamic history but in the history of social and political revolutions more broadly.
```

## Level 2 Essay

```
I do not think the Abbasid Revolution makes sense if it is described only as one family replacing another on the throne. That framing is not wrong at the level of political fact, because the Umayyads fell and the Abbasids took power. But it leaves too much unexplained. It cannot account for why the movement drew such a broad coalition in Khurasan, why the new regime relocated the imperial center eastward, or why non-Arab Muslims gained access to positions they had been largely excluded from before. At the same time, calling the revolution a straightforward social uprising also goes too far, because the military seizure of power in 750 followed a fairly conventional pattern of dynastic overthrow. So I would describe the Abbasid Revolution as a movement that began as a politically motivated seizure of power but enabled genuine social and administrative transformations, meaning the revolution label applies more to the consequences between 750 and 833 than to the uprising itself.

What stands out about the origins of the movement is that the coalition in Khurasan exceeded mere dynastic ambition. Abu Muslim, who emerged as the chief organizer of the revolt around 747, recruited across Arab settlers, mawali, and local Iranian populations in the eastern provinces. That breadth matters. A purely dynastic conspiracy would not have needed to mobilize such diverse groups, and it would not have relied on deliberately vague slogans about restoring rule to the Prophet's family rather than naming the Abbasid house directly. Al-Tabari's chronicle describes the movement rallying supporters under the call "to the chosen one from the family of Muhammad," a phrase flexible enough to attract Shi'i sympathizers, disaffected Arabs, and non-Arab converts who each read their own grievances into the message. Al-Tabari's account does not read like a sociological explanation of structural grievance. As I understand his narrative, he is interested in moral and political authority, in presenting legitimate leadership gathering visible momentum, not in taxation patterns or provincial resentment. Later analytical historians ask different questions. They want to know why eastern coalition building worked when other opposition movements failed, or why mawali grievance became politically explosive at that particular moment rather than earlier. Al-Tabari helps show how Abbasid legitimacy was narrated, and that narration is part of the event itself. The later analytical work helps reconstruct the conditions under which that narrative could become persuasive and effective. One account explains meaning, the other helps explain mechanism, and reading them together gives a stronger picture than either one alone. The black banners worked the same way as the slogan, marking a collective break from Umayyad authority without specifying exactly what would replace it. That deliberate ambiguity is itself evidence of something beyond a simple palace conspiracy. The organizers had to speak to structural frustrations in order to generate the support they needed, and that tells us the revolution's social base was real even if the leadership's ultimate goal was dynastic.

The military victory itself, however, followed a more conventional pattern. The Battle of the Zab in January 750 was decisive, but it was a pitched engagement between two organized armies along the Great Zab River in northern Iraq, not a mass popular insurrection sweeping through the provinces. The last Umayyad caliph, Marwan II, had already been weakened by internal revolts and factional divisions within his own coalition, which meant the Abbasid army faced a regime that was fracturing from within as much as it was being overthrown from without. That matters because it suggests the Umayyad collapse owed as much to the regime's own instability as to the revolutionary movement's social energy. Even more telling is what happened afterward. Abu Muslim, the figure most responsible for turning eastern grievance into coordinated military action, was executed on the orders of Caliph al-Mansur in 755. If the movement had been primarily about social transformation, eliminating its most effective popular leader would have been politically incoherent. Al-Mansur clearly saw Abu Muslim's independent authority as a threat to dynastic control, which reveals that consolidating family power mattered more to the new regime than honoring the coalition that had brought it to victory. I would not say this proves the revolution was purely dynastic, but scholars who emphasize that character have real grounds here. The counterargument deserves to be taken seriously. Still, the fact that the seizure of power looked dynastic does not mean the consequences were limited to a change of ruling house.

I think the changed status of non-Arab Muslims under the Abbasids is the strongest evidence for something beyond a palace coup. Under the Umayyads, mawali faced practical exclusion from administrative and military roles despite their formal membership in the Muslim community. They often continued to pay taxes associated with non-Muslim subjects even after conversion, and they were largely shut out of the Arab tribal networks that controlled access to political power. If a state claims universal religious legitimacy while preserving older status lines, the contradiction is going to become politically dangerous. After 750, mawali were gradually integrated into Abbasid governance in ways that would have been difficult to imagine under the old regime. The Barmakid family offers the clearest example. Originally from a Buddhist administrative background in Balkh, the Barmakids rose to serve as viziers under Harun al-Rashid, shaping fiscal policy, patronizing translation projects, and exercising real executive authority for nearly two decades before their fall from favor around 803. That integration of mawali into the governing order is precisely the kind of consequence that separates the Abbasid Revolution from a simple dynastic transfer.

The founding of Baghdad in 762 represents the revolution's longest-lasting material consequence. The city was not simply a replacement capital. Its location near the Tigris and Euphrates, close to eastern trade routes linking the caliphate to Persian and Central Asian commercial networks, gave the Abbasids a better position from which to organize revenue, movement, and communication than Damascus had offered the Umayyads. Al-Mansur's choice of a round city plan, with the caliph's palace and main mosque at the center, made the physical layout itself an expression of centralized authority. That matters because it linked administrative change to symbolic change. The capital was built as part of a political project, not inherited from a previous dynasty, and it became evidence that the empire was being imagined differently. The Abbasids formalized the vizier system, expanded a salaried bureaucracy staffed increasingly by mawali and Persian elites, and adopted court protocols influenced by Sasanian models of kingship rather than relying exclusively on Arab tribal conventions. A new family on the throne could have governed from Damascus using Umayyad structures. The Abbasids did not. They built new institutions, recruited new personnel, and created a new symbolic center. In that sense, Baghdad worked as a theory of empire in urban form, and it points to a transformation too deliberate and too structural to be explained by dynastic change alone.

So I would describe the Abbasid Revolution as operating on multiple registers, dynastic, political, and social, and I think collapsing them together distorts the timeline. The seizure of power between 744 and 750 was largely dynastic and military in character, visible in the conventional battle at the Zab and in al-Mansur's willingness to eliminate Abu Muslim once his usefulness had passed. The broader social revolution, visible in the integration of mawali like the Barmakids, the eastward shift of imperial gravity to Baghdad, and the construction of new administrative institutions modeled on Persian precedent, unfolded over the subsequent decades. I would not say the Abbasid Revolution was a social revolution in the way that phrase is sometimes used, as if it were a mass uprising driven by a clear program for equality. It was not that. But I also would not reduce it to a dynastic transfer, because the coalition that brought the Abbasids to power had real social energy behind it, and the regime that emerged afterward reshaped the empire in ways the Umayyads had not. The stronger evidence lies in what the Abbasids built once they had won, and that evidence, from Baghdad's round walls to the Barmakids' vizierate to the changed composition of the imperial court, points to a transformation too large to call merely dynastic.
```

## Level 2 + Sources Essay

```
The Abbasid Revolution is often described as either a social revolution or a dynastic transfer of power, as if those two categories are clean and exclusive. They are not. The movement that overthrew the Umayyads drew on real social grievances, but it was organized around a dynastic claim, and its immediate military victory in 750 did not by itself restructure the empire. What makes the revolution harder to classify is that its longer-term consequences between 750 and 833 changed the political order in ways that went well beyond replacing one ruling family with another. So the Abbasid Revolution is best described as a coalition-driven upheaval whose administrative and cultural transformations gave it a social character that its immediate military victory alone did not possess. The distinction between origin and effect is the key problem.

The revolution's origins do not make sense without understanding what happened in Khurasan under Abu Muslim. Al-Tabari's chronicle describes mobilization under black banners and connects the movement to "the family of the Prophet," a phrase broad enough to attract different groups without committing to one political program. That vagueness was strategic. Arab settlers frustrated with Umayyad governance, non-Arab converts denied full standing, Shi'i sympathizers hoping for Alid leadership, and other discontented populations could all see their grievances reflected in a deliberately open message. Al-Tabari's narrative emphasizes that Abbasid propaganda could unite these factions precisely because it did not spell out one exact political program. That emphasis matters because it reveals how the movement's organizers turned ideological ambiguity into a recruiting tool. Al-Tabari also suggests that eastern mobilization succeeded partly because Khurasan's distance from Damascus gave the movement room to organize without immediate suppression. Abu Muslim becomes important here not as a sole cause but as the figure who turned diffuse anger into coordinated action across a diverse region. Khurasan provided both the social base and the organizational space that made a broad coalition possible. Without that combination the dynastic claim alone would not have been enough. This already complicates the idea of a simple dynastic transfer, because the coalition that produced the victory was broader and more socially varied than a palace faction.

The mawali question is where the social dimension becomes most visible, but it also shows why a purely social explanation does not work on its own. Non-Arab converts occupied an awkward position under Umayyad rule: theoretically inside the Muslim community, yet still facing hierarchies that kept them below Arab elites in concrete ways. A note on social grievances makes this point directly, noting that conversion did not erase older status distinctions in taxation, military prestige, and political access. That gap between religious principle and political practice made the regime vulnerable. A state that claims universal religious legitimacy while preserving older ethnic hierarchies is creating a contradiction that will eventually become politically dangerous. At the same time, the same packet describes the movement as "a coalition of grievances rather than a single class uprising," and that framing matters because it resists the temptation to treat mawali resentment as the revolution's entire engine. A modern interpretation included in the historiographical material argues that the revolution depended equally on Umayyad factional crisis, eastern military organization, and the Abbasids' ability to speak in deliberately broad terms. Mawali grievance supplied energy, but it needed the coalition structure and the specific political conditions that channeled it into effective action. The grievances were social. The mechanism that converted them into victory was political and strategic.

The Battle of the Zab in 750 ended Umayyad control over the central caliphate and made the Abbasid claim to power materially real. The seminar notes on the battle stress that it mattered because earlier political anger had finally been converted into organized force. The last Umayyad caliph Marwan II was killed in the aftermath, and the caliphate as an institution survived intact under new management. Even so, organized force in the service of a dynastic claim is not the same thing as social transformation. Considered on its own, the Zab looks more like a decisive military overthrow than a revolution with social content. What followed the battle is what makes the social-revolution interpretation viable, and that gap between the battle itself and the administrative changes that came after is precisely the gap between dynastic origin and social effect.

The founding of Baghdad and early Abbasid administrative changes are the strongest evidence that the revolution did more than move the crown from one family to another. Al-Mansur founded the city in 762, and as the source material on administrative and urban change notes, its location near eastern trade routes and its orientation toward Persian administrative culture marked a geographic and political reorientation of the empire. Baghdad was not simply a replacement for Damascus. It was built as part of a political project, a new capital that could stand for a new imperial order precisely because it was not inherited from the Umayyads. The expanded role of viziers and secretaries matters here too. Early Abbasid government relied more visibly on Persian administrative practice, and positions dominated by Arab elites under the Umayyads became accessible to Persian-trained administrators. That changed who could count within the imperial order. The comparison between al-Tabari's chronicle and the modern historiographical interpretations makes this clearer. Al-Tabari frames the revolution around dynastic legitimacy and prophetic lineage. He is interested in moral and political authority, not in administrative restructuring or shifts in who staffs the bureaucracy. The modern interpretations reframe the same events as social in effect, because the new regime restructured access to power in ways that went beyond the dynastic claim itself. One account explains meaning. The other helps explain the conditions and consequences that gave that meaning lasting force. Reading them together produces a stronger account than either one alone, and the administrative evidence from Baghdad is where the later interpretation finds its strongest support.

Still, a serious case exists that the revolution was primarily a dynastic transfer. The Abbasids did not abolish the caliphate. They did not radically redistribute wealth or land. They replaced one Arab-Muslim ruling family with another and kept many of the same governing structures. Al-Mansur's execution of Abu Muslim is especially telling. Abu Muslim had organized the eastern coalition that made the Abbasid victory possible, and his elimination suggests that the regime's priorities were dynastic survival rather than loyalty to the social base that brought it to power. This argument works better for the revolution's immediate character than for its longer-term effects, though. The administrative restructuring, the geographic reorientation toward the east, the founding of Baghdad, and the broadened political access for non-Arab Muslims all constitute social change in effect even if the revolution was not socially uniform in origin. Another modern interpretation in the historiographical material argues precisely this point: the revolution was social in effect because it restructured who could matter within the empire. That seems too large a transformation to call merely dynastic.

So the Abbasid Revolution sits between the two categories rather than fitting neatly into either one. The short-term causes, including coalition politics, Umayyad weakness, and the military victory at the Zab, look more political and dynastic in character. The longer-term consequences between 750 and 833, including Baghdad, the expanded role of Persian administrative practice, and the reorientation of imperial culture, justify calling the revolution social in effect. It was not a unified social uprising, but it produced social consequences that a simple dynastic transfer would not have. Calling it one or the other misses what makes it historically interesting: the gap between what the movement claimed, how it won, and what the new order actually became.
```
