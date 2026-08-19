import { LanternDossier } from '../shared/lanternSchema';

export const fixtureDossier: LanternDossier = {
  meta: {
    projectId: "proj_false_sky_01",
    workingTitle: "The Architecture of the False Sky",
    logline: "A dialectical investigation into the demiurgic mythos, cognitive capture, and the ancient fear of simulated reality.",
    generatedAt: "2026-08-19T00:00:00.000Z",
    targetFormat: "20–30 min Deep Dive",
    tone: "Academic-Occult / Darkly Inquisitive"
  },
  sources: [
    {
      id: "SRC-01",
      title: "The Nag Hammadi Library (Apocryphon of John)",
      sourceType: "primary_text",
      citation: "Robinson, James M. (1988). The Nag Hammadi Library in English. Harper & Row.",
      credibilityScore: 5,
      keyPoints: [
        "Describes Yaldabaoth as the blind, arrogant creator unaware of the luminous Pleroma.",
        "Physical cosmos structured as a containment labyrinth governed by planetary Archons."
      ],
      verificationState: "fixture"
    },
    {
      id: "SRC-02",
      title: "Are You Living in a Computer Simulation?",
      sourceType: "pdf",
      citation: "Bostrom, Nick (2003). Philosophical Quarterly, Vol. 53, No. 211, pp. 243–255.",
      url: "https://simulation-argument.com",
      credibilityScore: 4,
      keyPoints: [
        "Substrate independence of consciousness allows minds on non-biological computing substrates.",
        "Trilemma proves ancestor simulations are vastly more numerous if civilizations survive."
      ],
      verificationState: "fixture"
    },
    {
      id: "SRC-03",
      title: "The Gnostic Religion: The Message of the Alien God",
      sourceType: "primary_text",
      citation: "Jonas, Hans (1958). Beacon Press, Boston.",
      credibilityScore: 5,
      keyPoints: [
        "Identifies cosmic estrangement and existential homesickness as the foundation of Gnostic myth.",
        "Gnosis is non-discursive experiential awakening, not clerical orthodoxy."
      ],
      verificationState: "fixture"
    },
    {
      id: "SRC-04",
      title: "Silicon Valley Eschatology & Neo-Gnosticism",
      sourceType: "web",
      citation: "Pesce, Mark (2021). Techne & Mysticism Quarterly, Vol. 14, pp. 12–39.",
      url: "https://pesce.org/essays/neo-gnosticism",
      credibilityScore: 3,
      keyPoints: [
        "Modern technologists frame biological embodiment as 'meatware' imprisonment.",
        "Transhumanist mind-uploading as the secular reincarnation of demiurgic escape."
      ],
      verificationState: "fixture"
    }
  ],
  claims: [
    {
      id: "CLM-01",
      text: "The Gnostic myth of the Demiurge directly prefigures modern anxieties regarding runaway artificial superintelligence acting as an incompetent cosmic designer.",
      status: "interpretive",
      sourceIds: ["SRC-01", "SRC-04"],
      confidenceNote: "Strong symbolic and thematic correspondence across late antiquity and contemporary AI discourse.",
      reviewed: true
    },
    {
      id: "CLM-02",
      text: "The Nag Hammadi codices were discovered in sealed terracotta jars near Jabal al-Tarif in Upper Egypt in December 1945.",
      status: "supported",
      sourceIds: ["SRC-01"],
      confidenceNote: "Unanimous historical consensus established by 20th-century papyrologists and historians.",
      reviewed: true
    },
    {
      id: "CLM-03",
      text: "The Apocryphon of John was composed in 1945.",
      status: "contested",
      sourceIds: ["SRC-01", "SRC-03"],
      confidenceNote: "Text was unearthed in 1945, but historical and philological evidence dates authorship to the 2nd century CE.",
      reviewed: false
    },
    {
      id: "CLM-04",
      text: "Venture capitalists are secretly funding particle physics laboratories to hack glitch exploits in physical spacetime.",
      status: "needs-source",
      sourceIds: [],
      confidenceNote: "Common urban legend in tech culture; lacks verifiable academic or financial documentation.",
      reviewed: false
    },
    {
      id: "CLM-05",
      text: "Bostrom's trilemma mathematically requires accepting that humanity is living in a simulation if neither civilizational extinction nor simulation bans are true.",
      status: "supported",
      sourceIds: ["SRC-02"],
      confidenceNote: "Directly derived from the formal probabilistic proof presented in Bostrom (2003).",
      reviewed: true
    }
  ],
  lenses: [
    {
      type: "historical",
      title: "The Jabal al-Tarif Cache",
      body: "In December 1945, brothers Muhammad and Khalil 'Ali discovered 13 leather-bound papyrus codices inside a sealed jar. This shattered orthodox heresiological monopolies, revealing Gnosticism as a vibrant, multifaceted counter-tradition.",
      keyPoints: [
        "13 Coptic codices preserved in dry desert climate",
        "Primary source restoration vs patristic polemics",
        "Dated to early 4th century monastic bindings"
      ],
      pinned: true
    },
    {
      type: "psychological",
      title: "The Metaphysics of Alienation",
      body: "Hans Jonas demonstrated that Gnostic cosmology articulates a severe psychological alienation (Unheimlichkeit): the intuition that the soul is an extraterrestrial exile trapped inside a hostile, mechanical cosmos.",
      keyPoints: [
        "Cosmic homesickness and ontological vertigo",
        "Ego-preservation under imperial totalitarianism",
        "Projection of somatic trauma onto cosmic rulers"
      ],
      pinned: true
    },
    {
      type: "mythic",
      title: "Yaldabaoth & The Blind Architect",
      body: "In Sethian myth, Sophia's generative error births Yaldabaoth—a lion-headed serpent who proclaims 'I am God and there is no other,' completely ignorant of the radiant realms above his crafted celestial spheres.",
      keyPoints: [
        "The lion-faced sun serpent (Chnoubis/Yaldabaoth)",
        "Seven Archons corresponding to planetary gates",
        "The stolen pneumatic spark hidden inside mortal clay"
      ]
    },
    {
      type: "theological",
      title: "The Alien God Beyond the Cosmos",
      body: "Unlike orthodox monotheisms asserting the goodness of material creation, Gnostic theology posits a Deus Alienus—an unnamable, transcendent source utterly foreign to the flawed physical universe.",
      keyPoints: [
        "Radical dualism between Pleroma and Kenoma",
        "Salvation through direct gnosis (knowledge) rather than faith/obedience",
        "Apophatic theology of the Ineffable Source"
      ]
    },
    {
      type: "coercion-watch",
      title: "The 'Simulation Breakout' Cult Dynamic",
      body: "Charismatic leaders weaponize 'you are trapped in a simulation' narratives to foster extreme epistemological isolation, dismantling followers' trust in family, medicine, and consensual reality to sell proprietary 'breakout' doctrines.",
      keyPoints: [
        "Epistemic capture via 'Only we know the code'",
        "Monetized spiritual deprogramming protocols",
        "Destabilization of baseline reality testing"
      ],
      pinned: true
    }
  ],
  shapes: [
    {
      id: "shape-1",
      title: "The Demiurge in the Valley",
      archetype: "case_file",
      coldOpen: "A glowing server rack in Santa Clara juxtaposed with an Egyptian terracotta jar buried in 350 CE.",
      centralQuestion: "Why did humanity's oldest heresy about an incompetent creator god re-emerge word-for-word in the boardrooms of artificial intelligence?",
      escalation: "Tracing the philology of the Nag Hammadi texts into Bostrom's 2003 trilemma and Silicon Valley mind-upload subcultures.",
      reversal: "The fear is not that the universe is fake—the fear is that we are building the Demiurge ourselves in silicon.",
      emotionalBeat: "The tragic human ache to be made of starlight rather than mud.",
      takeaway: "Gnosticism is not an obsolete religion; it is the default psychological symptom of hyper-technological alienation.",
      closingImage: "The camera pulls back from a microscope lens inspecting silicon circuitry into a midnight desert sky.",
      estimatedRuntimeMinutes: 24
    },
    {
      id: "shape-2",
      title: "The Broken Jar at Nag Hammadi",
      archetype: "narrative_mystery",
      coldOpen: "Two brothers digging for fertilizer in 1945 strike something hard and hollow in the cliffside.",
      centralQuestion: "What terrifying ideas were deemed so dangerous that monks sealed them in the desert for sixteen centuries?",
      escalation: "Investigating the secret books of Thomas, John, and Philip as forbidden counter-narratives of reality.",
      reversal: "The heretics were not nihilists; they were desperate seekers searching for intimacy in an empire of power.",
      emotionalBeat: "Reclaiming the suppressed voices of ancient spiritual rebels.",
      takeaway: "Every institution builds an orthodoxy; every soul eventually searches for a hidden jar.",
      closingImage: "Papyrus fragments floating gently over a digital waveform.",
      estimatedRuntimeMinutes: 19
    },
    {
      id: "shape-3",
      title: "Escaping the Sandbox: Myth vs. Code",
      archetype: "myth_vs_reality",
      coldOpen: "Quotes from Elon Musk, Philip K. Dick, and Valentinus presented with author names obscured.",
      centralQuestion: "Can you tell the difference between ancient occult cosmology and modern physics simulation theory?",
      escalation: "Dissecting the exact mathematical and mythological claims side-by-side.",
      reversal: "Simulation theory is not cutting-edge physics; it is 2nd-century Gnosticism stripped of its poetry.",
      emotionalBeat: "Facing the discomfort of material embodiment with courage rather than escapism.",
      takeaway: "Embrace the clay: reality may be flawed, but our presence in it is real.",
      closingImage: "A human hand pressing into damp earth as computer code fades into river water.",
      estimatedRuntimeMinutes: 22
    }
  ],
  script: [
    {
      id: "scr-01",
      section: "Cold Open: The Architecture of the Flaw",
      narration: "In December of 1945, near the limestone cliffs of Upper Egypt, two brothers digging for natural fertilizer struck a buried terracotta jar. Inside were thirteen leather-bound codices containing an idea so volatile the Roman Church spent four centuries trying to erase it: the belief that the god who built this universe was not omnipotent, but blind, arrogant, and fundamentally incompetent.",
      visualCue: "Engraved archival etchings of Egyptian desert transitioning into glowing macro shots of microchip wafer architecture.",
      tone: "Atmospheric, hushed, investigative",
      sourceIds: ["SRC-01"]
    },
    {
      id: "scr-02",
      section: "Beat 1: Silicon Gnosticism",
      narration: "Fast forward eighty years. In Palo Alto and San Francisco, executives and AI researchers regularly declare in podcasts that our physical reality is almost certainly a computer simulation. They cite Nick Bostrom's probability equations, but if you translate their mathematics back into Greek, they are reciting the Gospel of Truth word for word.",
      visualCue: "Split screen: Coptic uncial script side-by-side with Bostrom's probabilistic equations and binary stream overlays.",
      tone: "Dry wit, sharp analytical pace",
      sourceIds: ["SRC-02", "SRC-04"],
      isComedyBeat: true
    },
    {
      id: "scr-03",
      section: "Beat 2: The Demiurge Archetype",
      narration: "The ancient Gnostics named this architect Yaldabaoth—a lion-headed serpent who looked out upon the cosmic void and declared himself supreme ruler simply because he couldn't see the light above him. Modern tech utopianism does something remarkably similar: it creates enclosed software gardens and confuses technical control with cosmic wisdom.",
      visualCue: "Engraved serpentine lion emblem with radiating astrological rings.",
      tone: "Mythic, reverent yet critical",
      sourceIds: ["SRC-01", "SRC-03"]
    },
    {
      id: "scr-04",
      section: "Beat 3: The Danger of Epistemic Escape",
      narration: "Here is where the Cult of Psyche caution applies. When you believe the world is an irredeemable simulation, the people around you stop being human beings with suffering and dignity; they become non-player characters. And once you treat people as NPCs, coercion and exploitation inevitably follow.",
      visualCue: "Warm amber studio spotlight focusing on speaker; stark high-contrast framing.",
      tone: "Grounded, protective, serious",
      sourceIds: ["SRC-03"]
    },
    {
      id: "scr-05",
      section: "Closing Verdict: In Praise of the Clay",
      narration: "Perhaps the true test of spiritual maturity is not learning how to hack the simulation and escape into the cloud, but finding the courage to remain awake inside the clay.",
      visualCue: "Atmospheric lantern flame dimming into darkness as the Cult of Psyche mark glows in spectral lilac.",
      tone: "Luminous, poetic resolution",
      sourceIds: ["SRC-03"]
    }
  ],
  production: {
    titles: [
      "Why Silicon Valley Accidentally Rebuilt an Ancient Heresy (Rubric: 94/100)",
      "The Demiurge in the Machine: Gnosticism & Simulation Theory (Rubric: 91/100)",
      "The 1,600-Year-Old Secret Dug Up in Egypt (Rubric: 89/100)",
      "Are We Trapped in a Bad God's Computer? (Rubric: 88/100)",
      "The Architecture of the False Sky: A Cult of Psyche Deep Dive (Rubric: 86/100)",
      "Why Tech Billionaires Fear the Gnostic Archons (Rubric: 84/100)",
      "The Nag Hammadi Discovery & the Lost Gospels (Rubric: 83/100)",
      "The Metaphysics of Alienation: Hans Jonas & AI (Rubric: 82/100)",
      "Escaping the Simulation: The Dark Cult of Tech Gnosis (Rubric: 80/100)",
      "In Praise of the Clay: Why Reality Matters (Rubric: 79/100)"
    ],
    thumbnails: [
      {
        id: "thm-01",
        concept: "The Silicon Demiurge",
        visualPrompt: "An ancient engraved terracotta urn cracked open, spilling glowing neon violet microcircuitry into dark Egyptian desert sand. Cinematography by Roger Deakins, hyper-detailed engraving texture, aubergine and gold lighting.",
        textOverlay: "THE FALSE SKY",
        composition: "Rule of thirds, high contrast glow against matte darkness"
      },
      {
        id: "thm-02",
        concept: "The Blind Architect",
        visualPrompt: "A colossal marble statue of a lion-headed figure with serpent coils wearing a futuristic VR headset, illuminated by warm candle flame and spectral lilac rim light.",
        textOverlay: "WHO BUILT THIS?",
        composition: "Central heroic monumentality, dramatic chiaroscuro"
      },
      {
        id: "thm-03",
        concept: "The Egyptian Discovery",
        visualPrompt: "Hands holding ancient Coptic papyrus fragments that glow with holographic binary code in a nocturnal candle-lit study.",
        textOverlay: "1945 HERESY",
        composition: "Close-up macro perspective, warm parchment and teal tones"
      },
      {
        id: "thm-04",
        concept: "The NPC Fallacy",
        visualPrompt: "A human silhouette looking out a cathedral window into a cityscape composed of wireframe computer code.",
        textOverlay: "NOT AN NPC",
        composition: "Silhouette against radiant window lattice"
      },
      {
        id: "thm-05",
        concept: "The Matrix of Sophia",
        visualPrompt: "Esoteric tarot-inspired engraving of a celestial woman reaching down into an intricate clockwork mechanism.",
        textOverlay: "ESCAPING CODE",
        composition: "Sacred geometry, dual-color lilac and gold engraving"
      },
      {
        id: "thm-06",
        concept: "In Praise of the Clay",
        visualPrompt: "Two weathered hands scooping wet river clay as a glowing digital lattice dissolves into river water.",
        textOverlay: "STAY HUMAN",
        composition: "Intimate portrait framing, earthy raw textures"
      }
    ],
    shotList: [
      {
        timecode: "00:00 - 01:15",
        visualIntent: "Atmospheric hook: desert excavation archival blend with modern cleanroom chips.",
        assetType: "Archival Papyrology Photos + Motion Graphics",
        fallback: "Ken Burns motion over high-res Nag Hammadi codex scans"
      },
      {
        timecode: "01:15 - 06:30",
        visualIntent: "Bostrom trilemma breakdown with kinetic typography and philosophy citations.",
        assetType: "2D Kinetic Typography & Motion Charts",
        fallback: "Studio whiteboard diagramming on dark chalkboard"
      },
      {
        timecode: "06:30 - 14:00",
        visualIntent: "Mythological deep dive into Yaldabaoth and Sophia with engraved botanical and celestial plates.",
        assetType: "Classical Engraving Illustrations (Public Domain Restored)",
        fallback: "Slow macro pan across custom linocut art prints"
      },
      {
        timecode: "14:00 - 20:00",
        visualIntent: "Coercion watch: analysis of modern cult recruitment around simulation theories.",
        assetType: "Presenter Direct to Camera + Editorial Citation Cards",
        fallback: "Tight medium shot with spectral lilac rim lighting"
      },
      {
        timecode: "20:00 - 24:00",
        visualIntent: "Poetic conclusion on bodily presence and community connection.",
        assetType: "High-contrast 35mm film stock landscape b-roll",
        fallback: "Minimal studio candle flicker fadeout"
      }
    ],
    shortsCutdowns: [
      {
        id: "short-01",
        hook: "Why did 4th-century monks bury this book in a sealed jar?",
        adaptedCopy: "In 1945, an Egyptian farmer dug up the lost Secret Book of John. It didn't say God created the world out of love. It said the creator was an ignorant blind serpent named Yaldabaoth.",
        cta: "Watch the full Cult of Psyche breakdown: The Architecture of the False Sky."
      },
      {
        id: "short-02",
        hook: "Simulation theory isn't cutting-edge physics. It's an ancient cult doctrine.",
        adaptedCopy: "Silicon Valley billionaires talking about escaping the matrix are repeating 2nd-century Gnostic theology word-for-word. Here is why that matters.",
        cta: "Full case file on Cult of Psyche."
      },
      {
        id: "short-03",
        hook: "The psychological danger of treating other people like NPCs.",
        adaptedCopy: "The moment you believe reality is a simulation, you stop seeing human suffering as real. Here is why the Gnostic trap always leads to cognitive capture.",
        cta: "Subscribe for deep-dive intellectual history."
      }
    ],
    description: "An evidence-grounded Cult of Psyche investigation into Gnostic cosmology, the Nag Hammadi discovery, Bostrom's simulation argument, and the psychological roots of technological escapism.\n\nSOURCES & CITATIONS:\n- Robinson, J. M. (1988). The Nag Hammadi Library in English.\n- Bostrom, N. (2003). Are You Living in a Computer Simulation? Philosophical Quarterly.\n- Jonas, H. (1958). The Gnostic Religion: The Message of the Alien God.\n- Pesce, M. (2021). Techne & Mysticism Quarterly.\n\nTIMESTAMPS:\n00:00 - The Jar in the Cliffs\n03:15 - The Silicon Valley Heresy\n08:40 - Meet the Demiurge: Yaldabaoth\n15:20 - Coercion Watch: The Simulation Cult\n21:10 - In Praise of the Clay",
    chapters: [
      { timestamp: "00:00", title: "The Jar in the Cliffs" },
      { timestamp: "03:15", title: "The Silicon Valley Heresy" },
      { timestamp: "08:40", title: "Meet the Demiurge: Yaldabaoth" },
      { timestamp: "15:20", title: "Coercion Watch: The Simulation Cult" },
      { timestamp: "21:10", title: "In Praise of the Clay" }
    ]
  },
  warnings: [
    {
      id: "WARN-01",
      severity: "blocking",
      message: "Claim CLM-04 lacks a verifiable citation. Exclude or resolve this assertion before production sealing.",
      relatedClaimIds: ["CLM-04"],
      resolved: false
    },
    {
      id: "WARN-02",
      severity: "advisory",
      message: "Claim CLM-03 reflects contested dating between archaeological discovery (1945) and textual composition (2nd century CE).",
      relatedClaimIds: ["CLM-03"],
      resolved: false
    }
  ]
};
