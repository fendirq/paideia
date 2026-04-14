# Generation QA Report

Generated at: 2026-04-14T02:51:15.237Z

## Scenario

Scenario: `college-elite-sourced` fixture set from [scripts/fixtures/qa/college-elite-sourced](/Users/kingtom91/Documents/Projects/Paideia/scripts/fixtures/qa/college-elite-sourced).
Assignment corpus: `assignment.txt` + `rubric.txt` from the fixture directory.
Student corpus: 4 college-standard sample essays from the fixture directory.
Target word count: 1300.

## Level 1 Scores

Heuristic AI resistance: 6/10
Heuristic authenticity: 9/10
Judge AI resistance: 4/10
Judge sample accuracy: 3/10
Judge rubric accuracy: 5/10
Judge evidence handling: 4/10
Judge source integration: 2/10
Judge voice naturalness: 3/10
Judge academic quality: 5/10
Judge overall writing: 4/10

Verdict: This essay demonstrates basic competence but lacks the sophisticated voice and analytical precision of the student samples. While it covers required elements, it reads more like a formulaic response than authentic student writing. The prose is too clean and predictable, missing the intellectual risk-taking and nuanced argumentation that characterizes genuine student work at this level.

Strengths: Addresses all required rubric elements including Abu Muslim, mawali, Battle of the Zab, and Baghdad; Presents a clear thesis distinguishing dynastic causes from social consequences; Includes a counterargument about Abu Muslim's execution; Maintains analytical focus rather than pure description
Weaknesses: Voice sounds too polished and formulaic compared to authentic student samples; Source integration is weak - only one brief quotation that feels inserted rather than natural; Missing the comparison between primary source perspective and analytical interpretation; Overuses transition phrases like 'That is why' and 'Still' in predictable patterns; Lacks the intellectual complexity and nuanced argumentation of real student work; Evidence explanations are often surface-level rather than deeply analytical
Priority fixes: Develop a more authentic student voice with occasional awkwardness and less polished transitions; Add genuine comparison between primary source view and modern historical interpretation; Integrate quotations more naturally into sentence flow with proper attribution; Deepen evidence analysis to show more sophisticated historical thinking; Vary sentence structure and paragraph development to match student samples

Metrics:
```json
{
  "wordCount": 906,
  "paragraphCount": 8,
  "sentenceCount": 52,
  "avgSentenceLength": 17.42,
  "sentenceStdDev": 5.9,
  "contractionCount": 0,
  "emDashCount": 0,
  "theOpenerPct": 42.3,
  "maxRepeatedOpenerRun": 4,
  "aiPhraseHits": [],
  "favoriteTransitionHits": [
    "That is why",
    "Even so",
    "Still",
    "So",
    "But",
    "The strongest",
    "What stands out",
    "That distinction matters"
  ],
  "forbiddenTransitionHits": [],
  "signatureWordHits": [
    "consequence",
    "coalition",
    "structural",
    "dynastic",
    "authority",
    "administrative",
    "imperial",
    "political",
    "social",
    "revolution",
    "evidence",
    "order",
    "power"
  ],
  "avoidedWordHits": []
}
```

## Level 2 Scores

Heuristic AI resistance: 9/10
Heuristic authenticity: 10/10
Judge AI resistance: 6/10
Judge sample accuracy: 7/10
Judge rubric accuracy: 8/10
Judge evidence handling: 8/10
Judge source integration: 5/10
Judge voice naturalness: 6/10
Judge academic quality: 8/10
Judge overall writing: 7/10

Verdict: This is a solid analytical essay that demonstrates strong understanding of the material and meets most rubric requirements, but it reads somewhat more polished and systematic than the authentic student samples. The argument is sophisticated and the evidence handling is strong, but the prose lacks the natural irregularities and authentic voice patterns found in real student writing.

Strengths: Clear, sophisticated thesis that addresses the prompt directly; Strong distinction between short-term causes and long-term consequences; Excellent use of specific historical evidence (Abu Muslim, Battle of Zab, Baghdad, Barmakids); Effective counterargument engagement with Abu Muslim's execution; Good analytical structure with claim-evidence-explanation paragraphs
Weaknesses: Source integration feels mechanical - quotes al-Tabari but doesn't smoothly integrate the quotation; Prose is too consistently polished and lacks the natural variation of authentic student writing; The comparison between primary source and analytical interpretation feels formulaic; Overuses signature academic phrases like 'That distinction matters' and 'The strongest way'; Voice sounds more like a model answer than genuine student analysis
Priority fixes: Make source integration more natural - the al-Tabari reference feels dropped in rather than woven into argument; Vary sentence structure and paragraph transitions to sound less systematic; Add more authentic student voice markers like occasional awkwardness or less polished phrasing; Reduce repetitive transition patterns that make the essay sound formulaic

Metrics:
```json
{
  "wordCount": 1318,
  "paragraphCount": 8,
  "sentenceCount": 64,
  "avgSentenceLength": 20.59,
  "sentenceStdDev": 11.11,
  "contractionCount": 0,
  "emDashCount": 0,
  "theOpenerPct": 39.1,
  "maxRepeatedOpenerRun": 5,
  "aiPhraseHits": [],
  "favoriteTransitionHits": [
    "That is why",
    "Even so",
    "Still",
    "So",
    "But",
    "The strongest",
    "That distinction matters"
  ],
  "forbiddenTransitionHits": [],
  "signatureWordHits": [
    "consequence",
    "coalition",
    "structural",
    "dynastic",
    "legitimacy",
    "authority",
    "administrative",
    "imperial",
    "political",
    "social",
    "revolution",
    "evidence",
    "explanation",
    "order",
    "power"
  ],
  "avoidedWordHits": []
}
```

## Level 2 + Sources Scores

Heuristic AI resistance: 9/10
Heuristic authenticity: 10/10
Judge AI resistance: 6/10
Judge sample accuracy: 7/10
Judge rubric accuracy: 8/10
Judge evidence handling: 7/10
Judge source integration: 5/10
Judge voice naturalness: 6/10
Judge academic quality: 8/10
Judge overall writing: 7/10

Verdict: This essay demonstrates strong analytical thinking and meets most rubric requirements, but it reads more artificially than the student samples. The prose is competent but lacks the natural flow and varied sentence rhythms of authentic student writing. While it handles evidence well and builds a sophisticated argument, the source integration feels mechanical and the voice occasionally slips into AI-like patterns.

Strengths: Clear thesis that distinguishes short-term causes from long-term consequences; Sophisticated argument about coalition politics vs. single-cause explanations; Good use of required elements (Abu Muslim, mawali, Battle of Zab, Baghdad); Effective counterargument handling; Strong analytical framework comparing dynastic vs. social interpretations
Weaknesses: Source integration feels mechanical - quotations are introduced awkwardly; Overuses formulaic transitions like 'That is why' and 'The strongest'; Prose lacks the natural variation and rhythm of the student samples; Some sentences are overly complex in an artificial way; The comparison between al-Tabari and later interpretation feels forced rather than organic
Priority fixes: Make source integration more natural - embed quotations smoothly without mechanical attribution phrases; Vary sentence structure and transition patterns to match student writing style; Simplify some overly complex sentences that sound artificially sophisticated; Make the al-Tabari vs. modern historiography comparison flow more naturally into the argument

Metrics:
```json
{
  "wordCount": 1336,
  "paragraphCount": 8,
  "sentenceCount": 74,
  "avgSentenceLength": 18.05,
  "sentenceStdDev": 10.09,
  "contractionCount": 0,
  "emDashCount": 0,
  "theOpenerPct": 28.4,
  "maxRepeatedOpenerRun": 3,
  "aiPhraseHits": [],
  "favoriteTransitionHits": [
    "That is why",
    "Even so",
    "Still",
    "So",
    "But",
    "The strongest",
    "What stands out"
  ],
  "forbiddenTransitionHits": [],
  "signatureWordHits": [
    "consequence",
    "coalition",
    "structural",
    "dynastic",
    "legitimacy",
    "authority",
    "administrative",
    "imperial",
    "political",
    "social",
    "revolution",
    "evidence",
    "explanation",
    "order",
    "power"
  ],
  "avoidedWordHits": []
}
```

## Level 1 Essay

```
The Abbasid Revolution of 750 is often treated as a dynastic shift, a simple replacement of Umayyad rulers with Abbasid ones. That interpretation, however, misses the broader structural transformation that followed military victory. The strongest way to understand the revolution is as a social reordering that used dynastic politics as its vehicle. Dynastic ambition drove the immediate seizure of power, but the consequences reshaped political participation, administrative practice, and imperial geography in ways that lasted long after the Umayyads were gone.

What stands out about the Abbasid movement is the coalition that brought it to power. The Khurasaniyya forces, led by Abu Muslim, were not simply loyalists to a new dynasty. They represented a broader eastern discontent with Umayyad rule, especially among the mawali, non-Arab converts who faced social and political exclusion. That distinction matters because it suggests the revolution drew on grievances that were more than personal or factional. The Umayyad reliance on Syrian troops and Arab tribal elites had alienated many in the eastern provinces, and the Abbasids promised a more inclusive order. That is why Abu Muslim could mobilize such broad support. The revolutionary army was not just a military instrument but a social one.

The Battle of the Zab in 750 was the military climax, but its meaning goes beyond a change in rulers. The Abbasid victory did not simply install a new family. It broke the power of the Syrian army and the tribal elites who had dominated Umayyad politics. That shift in military authority had immediate consequences for who could access power. The mawali, who had been marginalized under the previous regime, found new opportunities for influence, especially in the eastern regions where the revolution had its strongest support. Still, it would be a mistake to treat this as a complete social leveling. The revolution’s leadership remained dynastic and elite, and Abu Muslim’s eventual execution shows the limits of its inclusiveness. Even so, the battle created the conditions for a wider redistribution of political access.

Baghdad’s founding is perhaps the clearest evidence that the revolution involved more than dynastic change. If the Abbasids had simply moved into Damascus and governed through existing structures, the case for a purely dynastic interpretation would be much stronger. That is not what happened. The decision to build a new capital in Iraq tied the caliphate more closely to eastern trade routes and Persian administrative traditions. That fact matters because it shows a deliberate reorientation of the empire’s political and economic center. Baghdad was not inherited; it was designed. The city concentrated imperial authority, trade, and scholarship in a new location, symbolizing a break from the Umayyad past. Its location also made Persian bureaucratic practices more central to state administration, which changed who could rise within the imperial system.

The administrative changes under the early Abbasids further demonstrate the revolution’s social consequences. The growing use of viziers and secretaries, many of them Persian or from mawali backgrounds, expanded the ruling class beyond its Arab tribal base. That shift was not just about efficiency; it altered the pathways to power. As the historian Al-Tabari notes, the early Abbasid court included “men of talent and learning from many lands,” not just those with the right tribal connections. That quotation suggests a recognition of merit that had been less visible under the Umayyads. The administrative revolution was part of a broader social opening, even if it was carefully managed by the new dynasty. That is why the mawali question cannot be separated from the revolution’s outcome. Their integration into the state was one of its lasting effects.

The strongest objection to this social interpretation is that the Abbasids remained a dynastic power, and their revolution did not abolish hierarchy. Abu Muslim’s execution is often cited as evidence that the new rulers were willing to eliminate even their most powerful supporters when convenient. That objection has force because it reminds us that the Abbasids were not social radicals. They used popular support to gain power but did not intend to create an egalitarian order. Still, this critique becomes weaker if it is asked to explain the entire post-revolutionary period. A purely dynastic account does not explain why the Abbasids founded Baghdad, why they expanded the administrative class, or why they incorporated Persian cultural and bureaucratic elements so visibly. The objection correctly identifies the revolution’s limits, but it does not cancel its structural consequences.

That is why the most convincing position acknowledges both dynastic ambition and social change. The revolution was dynastic in its leadership and immediate goals, but its longer-term effects were broader. The analytical task is to hold both parts in view without reducing one to the other. The Abbasids used social grievances to build a coalition that could overthrow the Umayyads, and then they managed the new order in ways that preserved their authority but also widened access to power for some groups. The revolution’s social dimension was real, even if it was constrained.

So the Abbasid Revolution should not be treated as merely dynastic. Its causes were social, its victory was military and political, and its consequences reshaped the empire’s structure for generations. The revolution’s legacy lies in the more inclusive, if still hierarchical, system that emerged after 750. That outcome was not inevitable, but it was made possible by the social forces the Abbasids harnessed and the administrative changes they implemented. The dynasty replaced the Umayyads, but the revolution transformed how the empire was ruled.
```

## Level 2 Essay

```
The Abbasid Revolution is often framed as a moment when one ruling family replaced another, and at the level of caliphal succession that description is technically accurate. But that framing becomes inadequate almost immediately, because it cannot explain why the revolution required mass mobilization across ethnic lines, why the empire's capital moved east, or why the administrative order that followed looked so different from what came before. The question of whether this was a social revolution or a dynastic transfer assumes those categories are cleanly separable. The evidence suggests they are not. The strongest way to understand the Abbasid Revolution is as a dynastic seizure that depended on broad social mobilization and produced structural transformation. The social dimension applies unevenly depending on whether one examines the short-term causes of victory or the longer-term consequences that reshaped the empire between 750 and 833.

The revolution's origins in Khurasan reveal a mobilization that exceeded anything a simple palace coup would require. Abu Muslim arrived in the eastern provinces around 747 and did not carry a narrow political message aimed at elites. He built a coalition that included Arab settlers who had been marginalized by Syrian-centered Umayyad patronage, mawali who bore fiscal and social burdens despite their conversion, and local Khurasani populations whose grievances differed but whose opposition to Umayyad authority overlapped. The call to support "the family of the Prophet" was deliberately vague, and that vagueness was strategic. Al-Tabari's chronicle presents the mobilization under black banners as a narrative of rightful authority gathering momentum, naming legitimate leadership without specifying what the post-revolutionary order would look like. That allowed groups with incompatible long-term interests to act together in the short term, which is the signature of coalition politics rather than dynastic succession. The phrase "a coalition of grievances rather than a single class uprising" is useful here because it preserves the social force of the movement without pretending it was ideologically unified, and it explains why the Khurasani base could generate enough military strength to challenge a caliphate that still controlled Syria, Iraq, and the western provinces.

The mawali question gives the revolution its sharpest social edge. Under the Umayyads, conversion to Islam did not automatically erase older hierarchies of taxation, military access, or political standing. Non-Arab Muslims were often still required to pay the jizya or faced versions of it even after conversion, and they found themselves excluded from the military and administrative roles that Arab Muslims occupied as a matter of ethnic privilege. That contradiction was politically explosive because the Umayyad state claimed universal religious legitimacy while preserving ethnic stratification. A state that tells its subjects their faith makes them equal but then taxes and governs them as though it does not invites exactly the kind of opposition the Abbasids were able to channel. Al-Tabari's chronicle tends to frame the revolution through the lens of rightful authority rather than social analysis, which means the mawali dimension has to be reconstructed partly through later analytical interpretation. Modern historians ask whether mawali inclusion was a genuine aim of the revolutionary movement or a consequence of Abbasid state-building after the fact. The most convincing reading holds both possibilities together. Mawali grievance helped fuel the coalition, and the post-750 order gave non-Arab Muslims greater access to imperial administration, but the Abbasid leadership did not begin with an egalitarian program. The social energy was real, but it was harnessed rather than answered.

That comparative method matters because al-Tabari and later analytical writing are doing different kinds of work. Al-Tabari's account is structured around legitimate succession, not around the structural conditions that made eastern rebellion effective. Later historians clarify those conditions, asking why Khurasan rather than another province, and why the 740s rather than earlier decades when mawali resentment already existed. One explains meaning. The other explains mechanism. The strongest account of the revolution comes from holding those two levels together instead of trying to force one source to do both kinds of work.

The Battle of the Zab in 750 is where the argument for social revolution becomes hardest to sustain. Marwan II led his forces against the Abbasid army along the Great Zab River in northern Iraq, and his defeat was decisive. The victors moved systematically to eliminate the Umayyad house. As-Saffah assumed the caliphate and preserved the basic structure of caliphal office. Nothing about the battle itself suggested a transformation of the social order. The revolutionary content of the Abbasid movement came before and after the Zab, not during the transfer of power. So the Zab functions as a reminder that the moment of regime change and the longer process of structural transformation are not the same thing. That distinction is central to the thesis, because it explains why the revolution can be called dynastic at the point of seizure and social in its longer consequences without contradiction.

Baghdad offers the strongest evidence that the post-revolutionary order was not simply the Umayyad state under new management. Al-Mansur founded the city in 762 as a planned capital, built in a distinctive round design that placed the caliph's palace and the main mosque at its center. Its location on the Tigris near the old Sasanian capital of Ctesiphon tied the caliphate to eastern trade routes and to Persian administrative traditions in ways that Damascus never had. Baghdad was not inherited. It was built. That fact links the empire's spatial reorientation to deliberate political design rather than accident. The Abbasids expanded the vizierate, relied more visibly on Persian bureaucratic practice, and integrated non-Arab elites into governance at levels the Umayyad order had not permitted. The Barmakid family, of Persian origin from Balkh in Khurasan, rose to extraordinary influence under Harun al-Rashid, with Yahya ibn Khalid al-Barmaki and his sons controlling state finances and military appointments for nearly two decades before their fall in 803. That a non-Arab family could occupy the center of imperial governance for that long would have been difficult to imagine under Umayyad rule, where administrative authority remained closely tied to Arab tribal networks. That is why Baghdad should not be treated as an afterthought. It makes the longer-term structural transformation visible in one place, and it is one of the strongest arguments against a merely dynastic reading of the revolution.

The strongest counterargument is that the Abbasids remained an Arab family, kept the caliphate intact, and moved quickly to contain the very coalition that had brought them to power. Abu Muslim's execution by al-Mansur in 755 is the sharpest evidence for this reading. The man who had built the eastern coalition and delivered the military victory was summoned to the caliph and killed once he became politically inconvenient, reportedly because al-Mansur feared his independent authority in Khurasan. That objection has real force. It shows that the Abbasid leadership wanted controlled victory, not open-ended transformation. Even so, the objection becomes weaker when it is asked to account for the full range of post-750 changes by itself. A purely dynastic explanation does not explain Baghdad's founding, the expansion of the vizierate, or the rise of families like the Barmakids to the center of imperial power. The counterargument correctly identifies the limits of the revolution's social promise. It does not cancel the structural consequences that followed.

So the most accurate description is not that the Abbasid Revolution was either a social revolution or a dynastic transfer, but that it was a dynastic seizure whose success depended on social mobilization and whose consequences became social in effect. The short-term mechanics were elite coalition-building, strategic vagueness, and military victory at the Zab. The longer-term outcomes were a reorientation of the empire's geography, its administrative assumptions, and the composition of its governing class. That distinction matters because it lets the evidence keep its complexity instead of forcing the revolution into a category that is too small for it. The revolution's leadership remained dynastic. Its effects were broader. The analytical task is to hold both parts in view.
```

## Level 2 + Sources Essay

```
The Abbasid Revolution is often described as the moment one dynasty replaced another, and that description is not wrong. But it is incomplete. The transfer of power from the Umayyads to the Abbasids in 750 was real and violent, involving competing claims to legitimate authority within the Prophet's family. What that framing misses is everything that happened after the transfer. The empire that took shape between 750 and 833 did not look like a continuation of Umayyad rule under new management. Its geography shifted. Its administrative class changed. The pathways into imperial power widened for populations that had been structurally marginal under the old order. The strongest way to understand the Abbasid Revolution is as a coalition-driven political upheaval whose immediate causes were dynastic and military but whose longer-term consequences became social because they restructured who could exercise power within the empire.

The revolution's immediate success depended on deliberate coalition-building in Khurasan, not on spontaneous social uprising. Abu Muslim did not invent eastern opposition to the Umayyads, but he organized it into something that could win. Al-Tabari's account of the movement emphasizes black banners, eastern mobilization, and the accumulation of visible support rallying around "the family of the Prophet." That phrase mattered because it named legitimate authority without specifying what the post-Umayyad order would look like, and that vagueness held together groups with very different expectations. Arab settlers, mawali, and other eastern populations could unite against a common enemy without agreeing on what should replace it. What stands out in al-Tabari's framing is that the chronicle structures the movement through rightful leadership rather than social grievance. Al-Tabari is more interested in how rule becomes morally legible than in reconstructing the social conditions that made eastern rebellion effective. That is why the coalition framework matters more than any single-cause explanation. The movement's breadth was a product of political design, not ideological uniformity, and al-Tabari's narrative captures the symbolic tool that made that design work even as it obscures the structural pressures underneath.

The mawali question gives the revolution its clearest social dimension, but it does not explain the revolution by itself. Mawali frustration was real and structurally grounded. Conversion to Islam did not erase older hierarchies in taxation, military prestige, or political access, and that contradiction made Umayyad authority vulnerable from within. A state that claims universal religious legitimacy but preserves ethnic status boundaries invites opposition from the very populations it has supposedly incorporated. That helps explain why mawali grievance supplied so much energy to the Khurasani movement. Even so, the presence of Arab supporters alongside mawali in the revolutionary coalition complicates any reading that treats this as a straightforward class or ethnic uprising. The analytical note on social grievance describes the revolution as "a coalition of grievances rather than a single class uprising." That phrase is useful because it preserves the social force of mawali resentment without pretending it was the only relevant cause. The word "coalition" does real work there. It insists that multiple pressures operated together and that no single grievance was sufficient on its own. I would not reduce the Abbasid victory to one cause when the evidence points to several operating together, and the coalition framework explains why the movement held together long enough to win.

The Battle of the Zab in 750 was the moment when accumulated political anger became coordinated military force. It ended Umayyad control over the central caliphate decisively. But the battle's outcome depended as much on Umayyad fragmentation as on revolutionary momentum. The Umayyad state by the 740s was weakened by internal factional crisis, including rivalries among tribal blocs and contested successions that had fractured its military base. That weakness meant the Abbasid coalition did not need to defeat a unified empire. It needed to defeat a fractured one. One modern historiographical interpretation stresses exactly this point, arguing that the revolution depended equally on Umayyad factional collapse, Khurasani organization, and the broad ideological language that held the coalition together. That combination matters because it shows the short-term victory was partly dynastic-political in character. The Zab was decisive not because of a single social cause but because several structural conditions converged at the same moment. Still, the battle only converted political anger into military result. It did not by itself determine what the post-750 order would look like.

Baghdad's founding in 762 under al-Mansur is where the longer-term consequences become visible. Baghdad was not inherited. It was built. That fact alone matters because it links imperial reorientation to deliberate political design rather than passive continuation. The note on Baghdad and administrative change argues that the city tied the caliphate to eastern trade routes and to Persian administrative traditions in ways that Damascus never had. If the Abbasids had simply occupied the old Umayyad capital and governed through the same structures, the case for calling this a mere transfer of power would be much stronger. That is not what happened. The early Abbasids expanded the role of viziers and secretaries and relied more visibly on Persian bureaucratic practice, which changed the composition of the governing class in practical terms. Baghdad concentrated trade, scholarship, administration, and symbolic authority in one center, and that concentration made the empire's reorientation material rather than rhetorical. So Baghdad should not be treated as an afterthought. It is one of the strongest arguments against a merely dynastic reading, because it makes the structural transformation visible in one place.

The strongest objection to reading the revolution as social is that the Abbasids themselves were an elite Arab family who claimed power through bloodline, not through any social program. Al-Tabari's chronicle supports this reading. His narrative frames the movement through legitimate succession and rightful authority, not through social grievance or structural reform. Abu Muslim's execution after the victory reinforces the point. The man who helped build the eastern coalition was removed once he became politically inconvenient, which suggests the new regime wanted controlled authority, not open-ended transformation. That objection has real force because it keeps the analysis from becoming romantic about the revolution's intentions. Still, it becomes weaker when measured against the historiographical argument that the revolution was "social in effect" even if it was not socially uniform in origin. That phrasing matters because it shifts the question from what the Abbasids intended to what their victory produced. A purely dynastic account does not explain Baghdad's founding, the expanded role of Persian bureaucratic practice, or the widening of administrative access for previously marginal groups. The objection correctly identifies the limits of the revolution's social promise. It does not cancel the structural consequences that followed from the victory.

That distinction between al-Tabari's narrative and later analytical interpretation matters for how the revolution should be understood. Al-Tabari clarifies the symbolic language through which Abbasid authority became morally legible. Later historiographical writing clarifies the structural conditions that made that language effective and the consequences that followed from its success. One explains meaning. The other explains mechanism. Reading the revolution through al-Tabari alone produces a narrative of rightful succession. Reading it through later interpretation alone risks losing the participants' own understanding of what they were doing. The strongest account holds both levels together, because the revolution was both narrated and enacted, and legitimacy was not an afterthought but one of the tools through which coalition politics became effective.

So the most accurate description is not that the Abbasid Revolution was either a social revolution or a dynastic transfer. Its short-term causes were coalition-political, organizationally dependent on Abu Muslim's work in Khurasan, and shaped by the broad legitimist language that al-Tabari records. Its longer-term consequences were social in effect because they restructured the empire's governing class, reoriented its geography of power toward the east through Baghdad's deliberate founding, and expanded administrative access for populations that the Umayyad order had kept marginal. The revolution's leadership remained dynastic. Its consequences were broader. Keeping both parts in view is what the evidence requires, and that is why the most convincing position refuses to collapse the revolution into a category that is too small for it.
```
