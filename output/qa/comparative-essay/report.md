# Generation QA Report

Generated at: 2026-04-18T01:32:02.842Z

## Scenario

Scenario: `comparative-essay` fixture set from [scripts/fixtures/qa/comparative-essay](/Users/kingtom91/Documents/Projects/Paideia/scripts/fixtures/qa/comparative-essay).
Assignment corpus: `assignment.txt` + `rubric.txt` from the fixture directory.
Student corpus: 4 college-standard sample essays from the fixture directory.
Target word count: 1500.

## Level 1 Scores

Heuristic AI resistance: 8/10
Heuristic authenticity: 9/10
Judge AI resistance: 8/10
Judge sample accuracy: 9/10
Judge rubric accuracy: 4/10
Judge evidence handling: 4/10
Judge overall writing: 6/10

Verdict: The essay captures the student's specific syntactic voice and argumentative templates perfectly, but completely fails the basic assignment requirements. At 798 words, it is only half of the 1500-word target length and lacks the required depth of close reading.

Strengths: Perfectly replicates the student's signature transitions ('What stands out to me is that,' 'This matters because,' 'Someone could argue that').; Establishes a clear, comparative thesis right from the introduction.; Captures the student's habit of contrasting two works through structural and moral differences.
Weaknesses: Massively under the required 1400-1600 word count.; Fails to provide two distinct passages for close reading from each text, offering only fleeting quotes instead.; The secondary source integration is extremely brief and feels tacked-on rather than thoroughly analyzed.; Close reading is virtually non-existent; quotes are dropped in without analyzing diction, imagery, or syntax.
Priority fixes: Expand the essay to meet the 1500-word target by deepening the analysis in every paragraph.; Incorporate at least two distinct passages from each primary text and perform actual close readings of the language.; Integrate the secondary source much more deeply into the main body paragraphs, showing exactly how it interacts with specific primary evidence.

Metrics:
```json
{
  "wordCount": 798,
  "paragraphCount": 7,
  "sentenceCount": 40,
  "avgSentenceLength": 19.95,
  "sentenceStdDev": 7.51,
  "contractionCount": 0,
  "emDashCount": 9,
  "theOpenerPct": 10,
  "maxRepeatedOpenerRun": 1,
  "aiPhraseHits": [
    "nuanced"
  ],
  "favoriteTransitionHits": [
    "What stands out to me is that",
    "If I had to choose,",
    "At the same time,",
    "In other words,",
    "But",
    "Someone could argue that",
    "Still,",
    "So while",
    "whereas",
    "So although",
    "By contrast,",
    "Meanwhile,",
    "There is a possible objection that",
    "So"
  ],
  "forbiddenTransitionHits": [],
  "signatureWordHits": [
    "matters",
    "structure",
    "problem",
    "performance",
    "community",
    "partly",
    "almost",
    "recognition",
    "distinction"
  ],
  "avoidedWordHits": []
}
```

## Level 2 Scores

Heuristic AI resistance: 10/10
Heuristic authenticity: 10/10
Judge AI resistance: 9/10
Judge sample accuracy: 10/10
Judge rubric accuracy: 10/10
Judge evidence handling: 9/10
Judge overall writing: 9/10

Verdict: An outstanding mimicry of the student's highly structured voice. The essay expertly deploys the student's specific dialectical transitions and argument structures while completely satisfying a complex, multi-part prompt and rubric.

Strengths: Perfectly captures the student's signature structural voice, including phrases like 'What stands out to me is that', 'This matters because', and the distinct counterargument template ('Someone could argue that... I understand that reading. Still...').; Flawlessly executes the rubric's demand for close reading by zeroing in on specific diction ('disgust', 'made', 'calmly').; Integrates both primary and secondary sources explicitly and effectively, using them to deepen the primary text analysis rather than just checking a box.
Weaknesses: The strict adherence to the student's structural templates is incredibly accurate but creates a slight mechanical rhythm over 1500 words, as every paragraph follows the exact same analytical architecture.; Occasional plot-summary heavy setups before getting to the close readings.
Priority fixes: Vary the placement or exact wording of the student's signature analytical moves so it feels less like a Mad Libs template.; Condense the plot setups (e.g., Victor's laboratory, Hyde's bank account) to get straight to the textual evidence faster.

Metrics:
```json
{
  "wordCount": 1567,
  "paragraphCount": 6,
  "sentenceCount": 77,
  "avgSentenceLength": 20.35,
  "sentenceStdDev": 8.07,
  "contractionCount": 0,
  "emDashCount": 0,
  "theOpenerPct": 26,
  "maxRepeatedOpenerRun": 2,
  "aiPhraseHits": [],
  "favoriteTransitionHits": [
    "What stands out to me is that",
    "If I had to put it plainly,",
    "In other words,",
    "But",
    "Someone could argue that",
    "I understand that reading.",
    "Still,",
    "So while",
    "whereas",
    "So"
  ],
  "forbiddenTransitionHits": [],
  "signatureWordHits": [
    "matters",
    "structure",
    "problem",
    "performance",
    "knowledge",
    "blindness",
    "institution",
    "script",
    "community",
    "authority",
    "almost",
    "simply"
  ],
  "avoidedWordHits": []
}
```

## Level 2 + Sources Scores

Heuristic AI resistance: 9/10
Heuristic authenticity: 10/10
Judge AI resistance: 9/10
Judge sample accuracy: 9/10
Judge rubric accuracy: 10/10
Judge evidence handling: 9/10
Judge overall writing: 9/10

Verdict: An exceptionally accurate replication of the student's highly structured, comparative voice. The essay follows the rubric perfectly, integrating primary and secondary sources while nailing the student's signature transitional phrases.

Strengths: Flawless mimicry of the student's rhetorical crutches (e.g., 'What stands out to me is that', 'If I had to put it plainly', 'Someone could argue that').; Meets all rubric constraints, including word count, close reading, and counter-argument structure.; Strong comparative thesis that elevates the argument beyond basic similarities, contrasting public failures of sympathy with private failures of respectability.
Weaknesses: Secondary source integration is a bit generic ('The critical essay from our seminar reader asks...'), missing an author or specific title attribution.; The heavy reliance on the student's exact transition formulas throughout every single paragraph risks feeling slightly repetitive, even though it accurately reflects the samples.
Priority fixes: Introduce the secondary source by an actual author name or title rather than just calling it 'the critical essay from our seminar reader' to meet standard academic attribution expectations.; Slightly vary the 'This matters because' and 'In other words' constructions so the essay doesn't read quite as much like a direct template of the student's past work.

Metrics:
```json
{
  "wordCount": 1580,
  "paragraphCount": 6,
  "sentenceCount": 74,
  "avgSentenceLength": 21.35,
  "sentenceStdDev": 9.56,
  "contractionCount": 0,
  "emDashCount": 0,
  "theOpenerPct": 20.3,
  "maxRepeatedOpenerRun": 4,
  "aiPhraseHits": [],
  "favoriteTransitionHits": [
    "What stands out to me is that",
    "If I had to put it plainly,",
    "At the same time,",
    "But",
    "Someone could argue that",
    "I understand that reading.",
    "Still,",
    "So while",
    "whereas",
    "So"
  ],
  "forbiddenTransitionHits": [],
  "signatureWordHits": [
    "matters",
    "structure",
    "problem",
    "performance",
    "knowledge",
    "blindness",
    "institution",
    "script",
    "community",
    "authority",
    "almost",
    "simply",
    "recognition",
    "distinction"
  ],
  "avoidedWordHits": []
}
```

## Level 1 Essay

```
I think Mary Shelley’s *Frankenstein* and Robert Louis Stevenson’s *The Strange Case of Dr Jekyll and Mr Hyde* both explore how monstrosity is produced, but they trace that production to different kinds of failure. What stands out to me is that Shelley ties monstrosity to abandonment and the refusal of sympathy, whereas Stevenson ties it to an internal splitting meant to protect reputation and suppress desire. The distinction matters because it shows that monstrosity is not just a physical category but a moral and psychological one, shaped by how characters respond to what they cannot accept in themselves or others. If I had to choose, Shelley gives the more tragic and socially resonant explanation, while Stevenson offers a more intimate anatomy of hypocrisy.

Shelley’s creature becomes monstrous not through his own nature but through the repeated rejection he faces from those who should care for him. This matters because the novel structures his narrative as a plea for recognition, framed within Victor’s own testimony. When the creature confronts Victor on the glacier, for example, he does not threaten violence at first. Instead, he asks for understanding and a companion. His speech is articulate, even philosophical, and he insists, “I was benevolent and good; misery made me a fiend.” At the same time, Victor’s refusal to listen—his physical and emotional withdrawal—creates the conditions for violence. In other words, Shelley suggests that monstrosity is produced socially, through a failure of responsibility and empathy. The creature’s later violence is almost a performance of the monstrosity others have already assigned to him.

Stevenson’s novel works differently because the monster here is not abandoned but deliberately created. Jekyll’s transformation into Hyde is an act of choice, motivated by a desire to separate his darker impulses from his respectable public self. This matters because Hyde represents not just repressed desire but a kind of concentrated irresponsibility. Jekyll’s initial pleasure in Hyde’s freedom—“I felt younger, lighter, happier in body”—comes from the sense that Hyde’s actions carry no consequences for Jekyll’s social standing. Stevenson’s narrative structure reinforces this division: we learn about Hyde through others’ fragmented, horrified accounts long before we get Jekyll’s confession. So while Shelley gives her creature a voice and a history, Stevenson keeps Hyde largely opaque, almost like a symptom rather than a person.

Someone could argue that both texts ultimately blame the creator rather than the creature, and that Shelley and Stevenson are making a similar point about scientific hubris. I see the appeal of that reading, but it feels slightly too neat. Victor’s sin is not just ambition; it is his refusal to care for what he has made. Jekyll’s sin is different—it is his attempt to evade moral accountability by creating a separate self. So although both figures are responsible, the nature of their responsibility differs. Victor’s failure is ethical and relational, while Jekyll’s is psychological and structural.

The secondary source packet complicates this distinction. In her lecture “Gothic Doubles,” Dr. Evans argues that both novels use doubling to critique masculine ambition and the fear of social exposure. I think that is partly right, but it does not fully account for the difference in narrative form. Shelley’s layered narration—Walton, then Victor, then the creature—creates a kind of echo chamber of testimony where no single perspective is fully reliable. That structure makes the reader complicit in judging who is responsible. Stevenson’s narrative, by contrast, withholds Jekyll’s voice until the end, making the horror one of gradual discovery rather than immediate sympathy. In other words, Shelley’s form asks us to listen, while Stevenson’s asks us to investigate.

There is a possible objection that *Jekyll and Hyde* is the more psychologically nuanced text because it shows how monstrosity arises from within, rather than from external rejection. I understand that reading, and it is true that Stevenson delves into the mechanics of self-division with a precision Shelley does not attempt. Still, *Frankenstein*’s emphasis on social abandonment feels more devastating because it implicates not just the individual but the community. The creature’s plea—“I am malicious because I am miserable”—suggests that monstrosity is made, not born, and that society has a role in its making. Meanwhile, Jekyll’s downfall is almost self-contained; it is a private drama of hypocrisy and self-betrayal.

So while both novels show that monstrosity is produced rather than innate, Shelley locates the problem in failed relationships and the refusal of empathy, whereas Stevenson locates it in the attempt to disown parts of the self. That is why *Frankenstein* feels more like a tragedy of social neglect, and *Jekyll and Hyde* more like a parable of moral evasion. I find Shelley’s explanation more convincing because it reaches beyond the individual to question how communities create the monsters they fear. But Stevenson’s account remains powerful because it shows how easily self-deception can become self-destruction.
```

## Level 2 Essay

```
In our unit on nineteenth-century Gothic fiction, we have consistently seen that the literary monster is rarely just a physical body. Mary Shelley in Frankenstein and Robert Louis Stevenson in The Strange Case of Dr Jekyll and Mr Hyde both explore the making of monsters, but they do not define scientific horror in the same moral shape. Frankenstein treats creation as an act that immediately collapses into social abandonment, framing disaster as a failure of outside structures to provide care. The novel shows this failure through layered acts of testimony where the monster has to argue for his own humanity. Dr Jekyll and Mr Hyde operates through a much quieter breakdown of authority, where danger grows from an internal obsession with reputation and professional boundaries, which the text reflects by withholding direct knowledge for most of the plot. What stands out to me is that both texts link physical violence to a failure of community, but one text blames the outside failure of caregivers while the other blames a deliberate choice to hide behind respectability. The comparison matters because it shows how cultural anxieties shifted over the course of the century. Shelley writes during the Romantic period, worrying about unchecked individual ambition and the limits of human sympathy. Stevenson writes decades later in the Victorian era, worrying about urban hypocrisy and the secret lives of the professional class. If I had to put it plainly, Shelley imagines monstrosity as a tragic product of neglect, whereas Stevenson imagines it as a calculated performance.

In Shelley, the central problem is that the creature is manufactured into a threat by a world that refuses to read him correctly. When Victor brings his creation to life in his laboratory, he immediately runs away from the physical reality of the body instead of taking responsibility for the mind he just built. Victor explicitly states that 'breathless horror and disgust fill my heart' the moment the creature opens its dull yellow eye, fleeing his own apartment. The word disgust is important here. It shows that Victor is not reacting to a moral threat, but simply to an aesthetic failure. This matters because the narrative forces the reader to see the disaster as a failure of parental authority rather than the birth of biological evil. Victor treats the new life as a terrifying spectacle. His blindness to the creature's emotional needs initiates a cycle of rejection that the creature cannot survive without turning violent. As the critic Anne K. Mellor argues in our source packet, Victor represents a dangerous model of intellectual production that tries to bypass the maternal role and the domestic institution of the family altogether. That secondary reading aligns perfectly with the primary text, since Victor isolates himself from his father and his fiancée in order to collect bones from charnel houses and produce life in a vacuum. He wants the glory of being a creator, but he completely ignores the social structure required to sustain a dependent subject. The novel frames this entire confession through Walton, another ambitious explorer who is writing letters to his sister. In other words, the outer narrative relies on family communication to warn the reader that ignoring social bonds leads to total ruin.

The creature is not born with malice, but he learns it by watching how institutions and families measure human worth. He spends months hiding near the De Lacey household, interpreting their language and studying the father's affectionate behavior. He even reads foundational human texts like Paradise Lost to understand the structures of kinship and divine justice. When he finally attempts to enter that social order, he is beaten and chased away strictly based on his visual appearance. This matters because the rejection proves that human sympathy has severe physical limits. The creature later explains his own corruption to Victor by insisting that 'misery made me a fiend', directly connecting the psychological toll of his isolation to his actions. The verb made is crucial in that sentence. It places the blame entirely on a process of social conditioning rather than a biological reality. Shelley explicitly ties the monster's violence to the denial of community. He only demands a female mate, a structural solution to his profound loneliness, and he turns to a systematic campaign of murder against Victor's family only when Victor destroys that half-finished companion. The novel uses a layered narrative structure, placing the creature's plea at the very center of the book, to ensure the reader understands his psychological development. The monster becomes legible through speech, proving that he understands the social contract far better than the human beings who refuse to extend it to him. In other words, the creature's monstrosity is historically manufactured by the people around him.

Dr Jekyll and Mr Hyde works differently because the text puts much more pressure on public reputation and the strict rules of professional society. Jekyll does not build a new life from scratch, but instead chemically alters himself so he can indulge his darkest habits without ruining his good name. In his final confession letter, Jekyll admits that he concealed his pleasures because he was determined to maintain an 'imperious desire to carry my head high' in public. The phrase carry my head high reveals that his primary motivation is not scientific discovery, but pure social vanity. He does not want to stop his bad behavior, only his accountability. This matters because the text presents monstrosity not as a tragic accident, but as a deliberate social strategy. Jekyll creates Hyde to follow a new script that exploits the anonymity of the modern city. He sets up a bank account for Hyde, rents him a house in a darker part of London, and even changes his handwriting to protect his professional reputation. In other words, the monster is a tool for navigating an urban landscape where respectability is the highest currency. As our source packet highlights through primary Victorian documents on criminal anthropology, nineteenth-century science became obsessed with identifying biological criminals. The packet includes a primary excerpt from Cesare Lombroso arguing that the true criminal displays 'physical markers of inner degeneracy' that can be read on the body. The novella plays with that exact anxiety, but it twists the premise. Hyde does look deformed to everyone who meets him, but the text never names a specific medical deformity. His physical shape is actually just the external shape of Jekyll's own hypocrisy. Monstrosity here is deeply internal.

Stevenson also makes the horror systemic by showing how the community prefers to ignore the truth, which is reflected in the narrative structure itself. The novella withholds direct knowledge of the transformation for a long time, forcing the reader to follow Utterson as he tries to solve a mystery using the language of contracts, wills, and blackmail. When Enfield witnesses Hyde attacking a young girl, he states that the man 'trampled calmly over the child's body and left her screaming' on the street. The word calmly is the most horrifying part of that description. It shows that the violence is not a crime of passion, but a completely routine action for a man operating under the protection of modern anonymity. The response from the community is not a grand moral crusade. It is a quiet financial settlement. The men force Hyde to pay off the girl's family with one hundred pounds, and then they agree never to speak of the incident again. That choice is important. The violence is absorbed back into the market logic of reputation and hush money. This matters because the tragedy of the novella is sustained by the professional silence of respectable men. Utterson refuses to read letters that might contain bad news, and Lanyon dies of shock rather than making his knowledge public. The critic Stephen Heath argues in our packet that Hyde is frightening precisely because he is a creature of the bourgeois establishment, not a true outsider. I think that is exactly right, especially when we compare Heath's claim to Enfield's financial compromise. Shelley gives us a monster who breaks into society from the margins, but Stevenson gives us a monster who is fully funded and protected by the center. So both authors tie violence to a social failure, but Shelley shows a failure of inclusion, whereas Stevenson shows a failure of honesty.

Someone could argue that Frankenstein actually offers the more severe critique of personal ambition, since Victor literally steals body parts and defies nature. I understand that reading. Shelley certainly makes Victor's arrogance central to the horror, and the sheer physical scale of the creature feels much grander than a man beating someone with a walking stick in London. Still, Dr Jekyll and Mr Hyde leaves me with a stronger sense of moral dread because the violence is completely integrated into daily urban life. Victor isolates himself to build his monster, but Jekyll uses the entire structure of the Victorian legal and financial system to protect his. The tragedy in Frankenstein happens because a creator abandons his responsibility. The tragedy in Stevenson happens because a citizen manages his responsibility almost too well, turning the law into a shield for his darkest impulses. So while both texts reveal the dangers of unchecked scientific experimentation, Frankenstein treats the monster as an alien seeking connection, whereas Dr Jekyll and Mr Hyde treats the monster as an insider demanding release. I end up finding Shelley more sympathetic, but Stevenson more insidious.
```

## Level 2 + Sources Essay

```
Frankenstein and The Strange Case of Dr Jekyll and Mr Hyde both center on the creation of a monster, but they do not trace the problem of horror to the same social institution. In Mary Shelley, the central problem is that a creator refuses responsibility and leaves his creation to be defined by a hostile world. In Stevenson, the problem is almost the reverse. A highly respectable citizen attempts to privately manage his own unacceptable desires by hiding them inside a completely separate identity. What stands out to me is that both novels tie monstrosity to tragic failures of care, yet they reach different conclusions about whether horror is created by social abandonment or by the internal quarantine of the self. The texts also approach this problem through very different structural forms. Shelley builds her novel through layered narratives that force the reader to listen to the creature explain his own suffering, while Stevenson builds his novella around urban secrecy and delayed confessions that keep the monster silent for much longer. Shelley writes when scientific discovery feels like a dangerous boundary crossed by ambitious individuals, while Stevenson writes when late Victorian professional culture feels like a rigid script that everyone must follow. If I had to put it plainly, Shelley imagines monstrosity as a public failure of sympathy, whereas Stevenson imagines it as a private failure of respectability.

Victor's mistake is not just that he builds a creature. It is that he expects his creation to perfectly reflect his own genius and runs away when the physical reality falls short. Shelley grounds this failure in the historical anxieties of early nineteenth century science, where the ambition to master natural life outpaces human morality. When Victor finally brings his work to life in chapter five, he describes how he "collected the instruments of life" around him so he might "infuse a spark of being into the lifeless thing" that lay at his feet. The moment is supposed to be a triumph of modern knowledge. Instead, he confesses that "breathless horror and disgust" filled his heart the moment he saw the dull yellow eye of the creature open. Victor's choice to call his own creation a catastrophe reveals his profound blindness. He immediately abandons the newborn being in the laboratory without any guidance or protection. He does not stay to teach the creature how to navigate the world. That distinction is important because the novel does not present the creature as naturally evil or violently dangerous upon his awakening. Instead, it locates the origin of horror in a systemic failure of paternal and social responsibility. Essentially, the creature becomes a monster largely because the only world he encounters trains him to see himself as one. The course lecture notes clarify this dynamic by pointing out that Shelley turns horror into a failed relationship where violence is learned through exclusion. Victor expects absolute aesthetic perfection, and his inability to read anything else proves this point by creating a terrifying vacuum of care. He is supposed to act as an authority, but he acts like a frightened spectator instead. The structure of the family breaks down at the exact moment it should begin, which proves that monstrosity here is a public failure of sympathy.

The creature is completely aware of this dynamic, which is why his eventual confrontation with Victor feels so legally and morally complex. When they finally speak on the glacier in chapter ten, the creature frames his entire history as a problem of misplaced sympathy and institutional failure. He appeals to an older historical framework of natural rights, arguing that he was fundamentally benevolent until universal rejection forced him into misery and revenge. He reminds Victor of his moral duty by insisting that he ought to be his creator's Adam, but is instead the "fallen angel, whom thou drivest from joy for no misdeed." That argument is crucial. He does not ask for power, for wealth, or for dominion over others. He explicitly states that "misery made me a fiend" and simply demands a companion who shares his physical defects and will not scream at his presence. This matters because the creature understands his own monstrosity as a social condition rather than an inherent biological truth. He essentially tells Victor that virtuous behavior requires a community that recognizes the subject as worthy of basic interaction. At the same time, Shelley imagines violence as the inevitable result of a society that denies entry to the physically abnormal. The novel keeps showing how the creature uses advanced logic, emotional intelligence, and highly formal language to diagnose his own isolation. He knows exactly what he lacks, and that self awareness makes his descent into murder feel remarkably tragic rather than simply terrifying. The tragedy is that he reads his own situation perfectly, but he still cannot escape it. He is trapped inside a vocabulary of worth that always places him on the outside, reinforcing the idea that monsters are made through social abandonment.

Jekyll works differently because the novel puts much more pressure on the demands of public reputation and professional status. His central mistake is not that he accidentally creates a separate being in a chaotic laboratory. It is that he actively tries to solve the moral complexity of human nature by cutting it into manageable, isolated pieces. This reflects the historical reality of late Victorian London, where bourgeois society demanded a perfect performance of propriety that left no room for natural human flaws. In chapter ten, Jekyll confesses that he learned to recognize the "thorough and primitive duality of man" and theorized that if these opposing natures "could but be housed in separate identities, life would be relieved of all that was unbearable." He assumes that chemical administration can cure a moral problem. That theory is inherently destructive. He engineers a solution specifically to maintain his polite status while indulging his cruelty without social consequence. The critical point here is that Hyde is not an external accident forced upon a passive victim. He is the direct result of a bourgeois culture that treats desire as something to be hidden and tightly controlled rather than integrated into a whole life. The experiment eventually fails because the divided self cannot actually sustain that kind of artificial boundary forever. The system simply breaks down when the repressed elements gain too much independent strength. Stevenson keeps showing how the desire for absolute respectability produces a shadow world of unregulated violence. Jekyll turns a medical practice into an instrument of personal evasion, demonstrating how monstrosity emerges from a private failure of respectability.

Hyde is especially unsettling because he operates perfectly well within the shadowy, transactional spaces of the modern city. He does not retreat to a remote wilderness to mourn his isolation like Shelley's creature. He simply rents a house, writes checks, uses a bank account, and walks through the streets of London at night. That integration is terrifying. Jekyll describes his own view of human nature as a "polity of multifarious, incongruous and independent denizens." That diction is deeply political and administrative. It treats the human soul like a crowded city where difficult residents can simply be evicted. The critical essay from our seminar reader asks what kinds of violence become possible when a culture of respectability treats desire as something that can be quarantined rather than owned. That question is necessary because Hyde is never totally outside the social order, which perfectly illustrates the critical claim. He relies on the exact same legal and financial structures that protect Jekyll. Ultimately, the horror in Stevenson depends entirely on the hypocrisy of the professional class. The monster here does not demand recognition or sympathy from his creator. He simply demands an exit route so he can continue his quiet consumption of the city. As that same critical essay points out, the monster in Shelley is "rejected into existence" while the monster in Stevenson is "managed into existence." Hyde eventually destroys Jekyll not because he is a foreign invader, but because he is the logical endpoint of a system that values the appearance of innocence over actual moral accountability. The tragedy of Jekyll is that his performance of goodness becomes completely indistinguishable from his practice of evil. He builds a prison out of his own privilege, sealing his fate as a victim of his own private quarantine.

Someone could argue that Frankenstein is the more universal novel because it strips the problem down to pure isolation, suffering, and the basic human need for affection. I understand that reading. Shelley certainly gives us a devastating picture of what happens when a conscious being is entirely deprived of community. Still, Victor's tragedy depends heavily on the external world repeatedly refusing to look past physical deformity, which makes the creature's violence a reaction to a society that will not change. The Strange Case of Dr Jekyll and Mr Hyde leaves me with a stronger sense of modern unease because the disaster unfolds entirely through voluntary self deception, not just through accidental prejudice. The doctor keeps seeing the danger of his experiment and then prioritizing his own reputation anyway. So while both novels connect horror to failed responsibility, Frankenstein shows how a monster can be created when society violently rejects the unknown, whereas The Strange Case of Dr Jekyll and Mr Hyde shows how a monster can be created when an individual artificially protects his own standing. That first model feels more emotionally tragic, but that second model feels more structurally corrupt.
```
