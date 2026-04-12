# Deep Level 2 Review

Generated: 2026-04-12

## Summary

This review focused on `Level 2` quality, especially:

- thesis clarity
- evidence specificity and count
- analytical depth
- interaction between the new source-grounding feature and the existing generation pipeline
- comparison against `Level 1`

No GitHub or deployment actions were taken during this review pass.

## Side-By-Side

### Level 1

Observed behavior:

- still tends to produce flatter, more generic essays
- often names fewer concrete historical details
- analysis is usually serviceable but thinner
- quality depends heavily on the prompt and does not reliably satisfy stronger rubric expectations

Representative issues seen previously in review:

- weak or broad thesis language
- fewer named examples
- less developed explanation after evidence
- more likely to sound like a decent high-school response than a strong premium output

### Level 2 Without Source Grounding

Latest live review result:

- word count: `751`
- clear thesis: `yes`
- concrete evidence: `yes`
- named details: `mawali`, `Khorasan`, `Abu Muslim`, `Baghdad`
- fragment-sentence bug: `not observed in final no-source run`

Assessment:

- materially better than earlier Level 2 runs
- now usually satisfies basic rubric structure
- still not as strong on evidence specificity as the grounded path
- still benefits a lot from source support when the assignment expects precise historical support

### Level 2 With Source Grounding

Latest live review result:

- word count: `847`
- clear two-part thesis: `yes`
- evidence count: `meets expectation`
- named evidence: `mawali`, `al-Abbas`, `Abu Muslim`, `Khorasan`, `Battle of the Zab (750)`, `Baghdad`, `Persian officials`
- analytical follow-through: `present after each major point`
- fragment-sentence bug: `not observed`

Assessment:

- this is the first pass I’m comfortable calling clean/flawless for the grounded Level 2 path
- the essay is clearly stronger than Level 1 on thesis, evidence density, and analysis
- the new source-grounding feature is doing real work, not cosmetic work

## Findings Fixed In This Review Cycle

1. Invalid source-link input was silently ignored.
Result:
Now blocked with a clear validation error before generation starts.

2. Source fetches had no timeout / HTML-size guard.
Result:
Added timeout and response-size protections.

3. Passcode admin could be downgraded to `STUDENT`, which broke Level 2 admin bypass during review.
Result:
Passcode login now restores the admin role.

4. Level 2 occasionally emitted broken fragment sentences like `Which was ...`.
Result:
Removed fragment-prone sentence split points from the deterministic post-processing layer.

5. Level 2 could still land under the required minimum word count.
Result:
Added a final compliance pass that explicitly fixes thesis/evidence/word-count compliance without discarding the student voice.

## Verdict

Current state:

- `Level 1`: acceptable baseline, still clearly weaker
- `Level 2 without sources`: significantly improved, but not yet as consistently strong as the grounded path
- `Level 2 with sources`: strong and reliable enough to count as the first flawless pass in this review cycle

## Latest Level 2 Essay

This is the latest grounded `Level 2` essay reviewed from the live app path:

```text
The Abbasids were able to overthrow the Umayyads because they took advantage of how angry a lot of people already were, built a real movement, and claimed they had the right to lead the Muslim world through their family connection to the Prophet. Their victory did not just change who was in charge. It changed the whole direction of the Islamic empire by moving power eastward and making things way more open to different groups of people.

The Abbasids got support because they spoke directly to the frustration that mawali, or non-Arab Muslim converts, had been feeling for a long time under Umayyad rule. The Umayyads treated non-Arab Muslims like they were second-class citizens even though they had converted to Islam and were supposed to be equals. For example, mawali were still expected to pay higher taxes and were kept out of important positions in the government and the military, which made a lot of people feel like the system was unfair. Basically the Umayyads did not actually care about the Muslim community as a whole, just the Arab elites at the top. Another reason is that the Abbasids claimed descent from al-Abbas, who was the Prophet Muhammad's uncle. And this gave them a kind of religious authority that made people take them seriously as an alternative to the Umayyads. The Umayyads did not have that same close family connection to the Prophet, so the Abbasid claim sounded stronger to people who cared about religious leadership. This shows that the Abbasids were smart about combining real anger from regular people with a claim to power that sounded good, which is what you need to start a revolution.

The Abbasids also turned all of that anger into an actual organized revolution. That is what made the difference. Abu Muslim was the person who organized support for the Abbasid cause in the region of Khorasan, which was in the eastern part of the empire far from the Umayyad center of power in Damascus. Khorasan mattered because it was so far away that the Abbasids could build up strength without being crushed right away. Abu Muslim was good at pulling together different groups of people in the region, including mawali and Arab settlers who were also unhappy with how the Umayyads ran things. He basically turned Khorasan into a base where the Abbasids could raise an army and get organized before the Umayyads even knew what was happening. All of this organizing led to the Battle of the Zab in 750, where the Abbasid forces defeated the Umayyad army in a fight that pretty much ended Umayyad control for good. After the battle the last Umayyad caliph tried to escape but was caught and killed, and the Abbasids took over as the new ruling family of the Islamic empire. This matters because without Abu Muslim pulling together support in Khorasan and without a clear military victory at the Zab, the Abbasids would have just been another group of people who were unhappy but could not do anything about it.

After the Abbasids took power, they changed the Islamic world in ways that went way beyond just replacing one ruling family with another. One of the biggest things they did was move the capital from Damascus to Baghdad. This was a big deal because Damascus was in Syria, which was close to the old Arab power base. But Baghdad was in Iraq, which was way closer to Persia and the eastern parts of the empire. They also started relying more on Persian officials to help run the empire instead of keeping everything in the hands of Arab elites. Persian traditions of government and administration became a bigger part of how the empire worked, and that made the whole system feel different from what the Umayyads had built. Baghdad became a center of learning, trade, and administration all at the same time, and that made it one of the most important cities in the world during that period. Scholars worked there, merchants passed through from all over, and officials helped run a huge empire from that one place. When a government brings in people from different backgrounds like the Abbasids did with Persian traditions and scholars and merchants, it shows they are trying to build something different from what came before. This shows that the Abbasid Revolution was not just about who got to be caliph but about changing the whole identity of the empire from being Arab-centered to being more open and connected to different cultures and regions.

In the end the Abbasids overthrew the Umayyads because they were able to use the frustration of non-Arab Muslims, organize a real military movement in Khorasan under Abu Muslim, and claim religious authority through their connection to the Prophet's family. But what made the revolution really matter was what came after. They moved the capital to Baghdad and built an empire that included people from a lot of different backgrounds. The Abbasid Revolution was not just a change in leadership. It was a change in what the Islamic empire was supposed to be.
```

## Current Recommendation

Do not ship more changes yet.

Best next move:

1. keep the new source-grounded Level 2 path
2. continue refining unguided Level 2 so it approaches the grounded path even when the user does not provide source material
3. only after that consider a push
