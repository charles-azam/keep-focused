/* Stillpoint — content. Written for a brain that misses thinking.
   Facts aim high: the reward is recognition, not explanation. */
(function () {
  const KF = window.KF;
  const C = (KF.content = {});

  // ---------------------------------------------------------------- FACTS
  // field, title, body, glyph(optional mono line)
  C.facts = [
    { field: "mechanics", title: "Every symmetry hides a conservation law",
      body: "Noether's theorem: each continuous symmetry of the action yields a conserved quantity. Invariance under time-translation gives energy; under space-translation, momentum; under rotation, angular momentum. Conservation isn't an accident of the universe — it's its grammar.",
      glyph: "δS = 0  ⟹  ∂ₜ Q = 0" },

    { field: "thermodynamics", title: "No engine beats the Carnot bound",
      body: "Between a hot and a cold reservoir, the best possible efficiency is fixed by their temperatures alone — not by cleverness, not by working fluid. Everything else is friction and regret.",
      glyph: "η ≤ 1 − T_c / T_h" },

    { field: "information", title: "Forgetting costs heat",
      body: "Landauer's principle: erasing one bit of information must dissipate at least kT ln 2 of energy as heat. Computation can in principle be reversible and free; only throwing memory away has a price. Information is physical.",
      glyph: "E ≥ k_B T ln 2  ≈  3 zJ" },

    { field: "statistics", title: "Sums forget their origins",
      body: "The central limit theorem: add enough independent finite-variance things and the result is Gaussian, no matter what you added. The bell curve isn't a law of nature so much as a law of large numbers — the shape of not-knowing-the-details.",
      glyph: "Σ Xᵢ  →  𝒩(μ, σ²)" },

    { field: "linear algebra", title: "The determinant is a volume",
      body: "For a linear map, the determinant is the signed factor by which it scales volume. Negative means it flips orientation; zero means it crushes space into a lower dimension, which is exactly why a zero determinant has no inverse.",
      glyph: "det A = 0  ⟺  A collapses" },

    { field: "dynamics", title: "Stability lives in the eigenvalues",
      body: "Linearize a system near equilibrium and the fate of small disturbances is written in the eigenvalues of the Jacobian: all real parts negative and it returns to rest; one of them positive and it runs away. The whole of stability theory is reading that sign.",
      glyph: "Re(λ) < 0  ∀λ  ⟹  stable" },

    { field: "astrophysics", title: "A teaspoon weighs a mountain",
      body: "In a neutron star, gravity has crushed electrons into protons. A sugar-cube of the stuff would weigh about a billion tonnes. It is, essentially, one atomic nucleus the size of a city, spinning hundreds of times a second.",
      glyph: "ρ ≈ 4 × 10¹⁷ kg/m³" },

    { field: "astrophysics", title: "There is a mass white dwarfs cannot exceed",
      body: "Electron degeneracy pressure — a consequence of the exclusion principle, not heat — holds a white dwarf up. But it has a limit. Above about 1.4 solar masses the pressure loses to gravity, and the star detonates as a type Ia supernova. The bomb has a fixed yield, which is why we use it as a cosmic ruler.",
      glyph: "M_Ch ≈ 1.44 M_☉" },

    { field: "biophysics", title: "You contain a rotary engine",
      body: "ATP synthase is a true molecular motor. A flow of protons across the inner mitochondrial membrane spins a shaft at over a hundred revolutions per second, and each turn mechanically forges ATP. You are, in part, run by turbines a few nanometres wide.",
      glyph: "H⁺ gradient → torque → ATP" },

    { field: "cell biology", title: "Your power plants were once guests",
      body: "Mitochondria descend from free-living bacteria swallowed whole roughly two billion years ago. They still keep their own circular genome and divide on their own schedule. Every breath you take feeds an ancient symbiosis you never agreed to but cannot live without.",
      glyph: "endosymbiosis, ~2 Gyr ago" },

    { field: "quantum", title: "The vacuum pushes two plates together",
      body: "The Casimir effect: place two uncharged conducting plates a hair apart and they attract, because the empty space between them can host fewer quantum field modes than the space outside. Nothing, properly counted, has pressure.",
      glyph: "F/A = − π² ħc / 240 d⁴" },

    { field: "general relativity", title: "Your GPS believes in Einstein",
      body: "Satellite clocks tick faster than ground clocks: ~45 µs/day from weaker gravity, minus ~7 µs/day from their speed. Left uncorrected, the relativistic error would push your position off by about ten kilometres a day. Navigation is applied spacetime.",
      glyph: "Δt ≈ +38 µs / day" },

    { field: "optics", title: "Sunlight takes ten thousand centuries to leave",
      body: "A photon born in the Sun's core is absorbed and re-emitted so often that it random-walks outward for tens of thousands of years before reaching the surface. The light warming your face is older than agriculture, and crossed the last 150 million km in eight minutes.",
      glyph: "core → surface: ~10⁴–10⁵ yr" },

    { field: "fluid dynamics", title: "Turbulence is the last classical mystery",
      body: "The Navier–Stokes equations are short enough to write on a napkin, yet whether their solutions always stay smooth is an open Millennium Problem. Energy cascades from large eddies to small in a self-similar shower until viscosity finally turns motion into heat.",
      glyph: "E(k) ∝ k^(−5/3)" },

    { field: "number theory", title: "The primes thin out, predictably",
      body: "The number of primes below x is asymptotically x / ln x. The primes feel random up close, yet obey a smooth law at scale — and exactly how the error term behaves is the Riemann Hypothesis, still unproven after a century and a half.",
      glyph: "π(x) ~ x / ln x" },

    { field: "algebra", title: "The quintic has no formula",
      body: "There is a quadratic formula, a cubic, a quartic — and then it stops. Abel and Galois showed the general fifth-degree polynomial cannot be solved by radicals, because the symmetry group of its roots is, for the first time, not solvable. Some walls are made of group theory.",
      glyph: "S₅ is not solvable" },

    { field: "analysis", title: "An infinite sum of nothing in particular is π²/6",
      body: "Add the reciprocals of every square — 1 + 1/4 + 1/9 + … — and the answer is π²/6. Euler found it by treating sin x as an infinite polynomial. There is no circle in the question, yet π walks calmly out of the answer.",
      glyph: "Σ 1/n² = π² / 6" },

    { field: "topology", title: "You cannot comb a hairy ball flat",
      body: "Any continuous tangent vector field on a sphere must vanish somewhere — the hairy ball theorem. It's why there is always at least one point of calm wind on Earth, and why a perfectly smooth global wind is topologically forbidden.",
      glyph: "χ(S²) = 2 ≠ 0" },

    { field: "thermodynamics", title: "Equipartition shares energy fairly",
      body: "At thermal equilibrium each quadratic degree of freedom carries exactly ½kT of energy, on average — translation, rotation, the stretch of a bond. Temperature is just energy democratically divided among the ways a thing can move.",
      glyph: "⟨E⟩ = ½ k_B T per d.o.f." },

    { field: "chemistry", title: "Ice floats, and so we live",
      body: "Water is densest at 4 °C, not at freezing. So lakes cool from the top, ice forms above and insulates the liquid below, and life overwinters in the dark water. A quirk of hydrogen-bond geometry is quietly load-bearing for the biosphere.",
      glyph: "ρ_max at 3.98 °C" },

    { field: "materials", title: "Glass is a solid that never decided",
      body: "Glass is amorphous — its molecules are frozen mid-disorder, with no crystalline lattice. The old story that cathedral windows are thicker at the bottom because glass slowly flows is a myth; they were simply made unevenly. Glass does not creep on human timescales.",
      glyph: "no long-range order" },

    { field: "astronomy", title: "The dark sky is a clock",
      body: "Olbers' paradox: in an infinite, eternal, static universe every sightline would end on a star and the night would blaze. It doesn't. The darkness is evidence the universe had a beginning and is expanding — cosmology you can read by simply looking up.",
      glyph: "night is dark ⟹ finite age" },

    { field: "cosmology", title: "The whole sky is glowing, faintly",
      body: "The cosmic microwave background is light from when the universe first turned transparent, 380,000 years after the Big Bang, stretched by expansion into microwaves at 2.725 K. About 1% of old analogue TV static was this — the afterglow of creation, on the wrong channel.",
      glyph: "T_CMB = 2.725 K" },

    { field: "rocketry", title: "Getting to orbit is exponentially expensive",
      body: "The rocket equation says your velocity gain depends on the logarithm of your mass ratio. To go faster you must carry more fuel, which you must also accelerate — so demands compound. This single logarithm is why rockets are almost entirely fuel, and why staging exists.",
      glyph: "Δv = v_e · ln(m₀/m_f)" },

    { field: "particle physics", title: "Nobody knows why it's 1/137",
      body: "The fine-structure constant sets the strength of electromagnetism — how tightly light couples to charge. It is dimensionless, about 1/137.036, and pure number. Feynman called it 'one of the greatest damn mysteries of physics': a magic number with no accepted explanation.",
      glyph: "α ≈ 1 / 137.036" },

    { field: "biology", title: "Metabolism scales by a three-quarter power",
      body: "Kleiber's law: across thirty orders of magnitude in mass, an organism's metabolic rate scales as mass to the ¾. A whale and a mouse run on the same fractal accounting of branching supply networks. Life budgets energy by a universal exponent.",
      glyph: "B ∝ M^(3/4)" },

    { field: "neuroscience", title: "Your eye has a hole you never see",
      body: "Where the optic nerve leaves the retina there are no photoreceptors — a real blind spot in each eye. You never notice, because the brain quietly paints over it with a plausible guess from the surroundings. Most of what you 'see' is inference.",
      glyph: "fovea ≠ whole picture" },

    { field: "botany", title: "Plants count in golden angles",
      body: "Leaves and seeds spiral at about 137.5°, the golden angle, because that's the rotation that never repeats and so packs new growth with the least overlap and shadow. Sunflowers solve an optimization problem in real time, in florets.",
      glyph: "φ-angle = 360°/φ² ≈ 137.5°" },

    { field: "condensed matter", title: "Helium climbs out of its cup",
      body: "Cooled below 2.17 K, liquid helium-4 becomes a superfluid with zero viscosity. It flows without friction, conducts heat almost perfectly, and creeps up walls in a thin film to escape any container. A macroscopic quantum state, behaving like one enormous atom.",
      glyph: "λ-point: 2.17 K" },

    { field: "geometry", title: "Parallel lines were always a choice",
      body: "For two millennia geometry rested on Euclid's fifth postulate. In the 1820s Lobachevsky and Bolyai simply denied it and found a perfectly consistent geometry where infinitely many lines run parallel through a point. Space's flatness is an assumption — and, per Einstein, an empirical one.",
      glyph: "curvature κ < 0 : hyperbolic" },

    { field: "quantum", title: "You cannot sharpen both at once",
      body: "The uncertainty principle isn't about clumsy measurement; it's that position and momentum are Fourier conjugates. A wave sharply located in space is necessarily spread across many wavelengths. The trade-off is built into what a 'particle' even is.",
      glyph: "Δx · Δp ≥ ħ/2" },

    { field: "ecology", title: "Order from nobody in charge",
      body: "A murmuration of ten thousand starlings has no leader. Each bird tracks roughly seven neighbours — align, avoid, attract — and from those local rules a single fluid shape pours across the sky. Emergence is the universe's favourite trick: global pattern, no global plan.",
      glyph: "local rules ⟹ global form" },

    { field: "geomorphology", title: "Rivers meander at a fixed rhythm",
      body: "Left alone, a river's bends settle into a wavelength about eleven times its width — true for a creek and for the Amazon alike. The pattern is scale-free, the signature of a process balancing flow, friction, and the slow erosion of its own outer banks.",
      glyph: "λ ≈ 11 · w" },

    { field: "mathematics", title: "Truth outruns proof",
      body: "Gödel's first incompleteness theorem: any consistent formal system rich enough to do arithmetic contains true statements it can never prove. Mathematics is not a machine that grinds out all truths — there will always be more that is true than can be derived.",
      glyph: "Con(T) ⟹ ∃ G : T ⊬ G" },

    { field: "fixed points", title: "Contractions always converge",
      body: "Banach's theorem: a map that shrinks all distances on a complete space has exactly one fixed point, and repeatedly applying it from anywhere homes in on it. This single fact underwrites why Newton's method, Picard iteration, and countless solvers actually work.",
      glyph: "d(Tx,Ty) ≤ q·d(x,y), q<1" },

    { field: "electromagnetism", title: "Light is two fields chasing each other",
      body: "Maxwell noticed his equations let a changing electric field make a magnetic one, and vice versa, propagating at a speed set by two lab constants — which came out equal to the speed of light. Optics turned out to be a corner of electromagnetism. The universe revealed in four lines.",
      glyph: "c = 1 / √(ε₀ μ₀)" },

    { field: "biology", title: "The code is nearly universal",
      body: "Almost every living thing reads DNA with the same codon dictionary — 64 triplets for 20 amino acids and a stop. The redundancy is a buffer: many single-letter slips change nothing. A shared, error-tolerant cipher, written once and barely edited in four billion years.",
      glyph: "64 codons → 20 + stop" },

    { field: "acoustics", title: "Stiffness over density sets the pitch of solids",
      body: "Sound runs through a material at roughly the square root of its stiffness divided by its density — about 5 km/s in steel, fifteen times faster than in air. It's why a struck rail sings down the line long before you hear it through the air.",
      glyph: "v ≈ √(E / ρ)" },

    { field: "thermal radiation", title: "You are glowing right now",
      body: "Every warm body radiates, with a spectrum peaking at a wavelength inversely proportional to temperature (Wien's law). At 37 °C you shine in the far infrared near 9–10 µm — invisible to the eye, plain to a thermal camera. Darkness is just light you can't see.",
      glyph: "λ_max · T = 2.898 mm·K" },

    { field: "chemistry", title: "Catalysts cheat the clock, not the books",
      body: "A catalyst lowers the activation energy of a reaction without being consumed, speeding both directions equally — so it changes how fast equilibrium arrives, never where it lies. Enzymes do this with such precision they can accelerate a reaction by a factor of 10¹⁷.",
      glyph: "lowers Eₐ, ΔG unchanged" },

    { field: "astronomy", title: "Saturn would float",
      body: "Saturn's mean density is about 0.69 g/cm³ — less than water. Find an ocean big enough and the whole planet, rings and all, would bob on the surface. Mass is not the same as heft; a gas giant is mostly hydrogen held loosely by its own gravity.",
      glyph: "ρ_Saturn ≈ 0.69 g/cm³" },

    { field: "crystallography", title: "Snowflakes obey water's bond angle",
      body: "Every snow crystal is six-sided because water molecules hydrogen-bond into a hexagonal lattice. The branching detail records the exact path of temperature and humidity each crystal fell through — so no two are alike, yet all are sixfold. Local physics, global signature.",
      glyph: "ice Iₕ : hexagonal" },

    { field: "scaling", title: "Why ants are strong and elephants are careful",
      body: "Strength scales with cross-section (length²) but weight with volume (length³). Shrink an animal and it grows proportionally mighty; enlarge it and it risks crushing under itself. The square–cube law quietly governs why there are no insects the size of horses.",
      glyph: "strength/weight ∝ 1/L" },

    { field: "complex analysis", title: "The most beautiful equation is a rotation",
      body: "Euler's identity ties together 0, 1, e, i, and π in one line. It looks mystical but it's geometry: e^(iθ) traces the unit circle, and at θ = π you've simply turned halfway around to land on −1. Five constants, one half-turn.",
      glyph: "e^(iπ) + 1 = 0" },

    { field: "biophysics", title: "Some animals survive being switched off",
      body: "A tardigrade can expel nearly all its water, replace it with protective sugars and proteins, and enter cryptobiosis — metabolism slowing toward zero. In that glassy state it has survived boiling, freezing, the vacuum of space, and radiation that would sterilise most life.",
      glyph: "cryptobiosis: metabolism → 0" },

    { field: "gravitation", title: "Tides come from a difference, not a pull",
      body: "The Moon doesn't lift the ocean so much as pull the near side harder than the far side. It's the gradient of gravity — the difference across Earth's diameter — that raises two bulges. Tides are a derivative made visible twice a day.",
      glyph: "F_tide ∝ 1/r³" },

    { field: "perception", title: "Colour is a three-number summary",
      body: "Your retina samples the entire continuous spectrum with just three cone types. Every colour you've ever seen is a point in that 3-D space — which is why a screen mixing only red, green, and blue can fool you completely. We don't see light; we see a compression of it.",
      glyph: "∞-dim spectrum → ℝ³" },

    { field: "chaos", title: "Determinism is not predictability",
      body: "The double pendulum follows Newton's laws exactly, yet two launches differing in the twelfth decimal place diverge into wholly different motions within seconds. The future is fixed and still unknowable — sensitivity to initial conditions, the heart of chaos.",
      glyph: "λ > 0 : exponential divergence" },

    { field: "geophysics", title: "The ground beneath you is convecting",
      body: "Earth's mantle is solid rock, yet over millions of years it flows like a viscous fluid, carrying continents a few centimetres a year — about the speed your fingernails grow. The Atlantic is wider than when you were born. Solid is a matter of timescale.",
      glyph: "v ≈ 2–10 cm / yr" },
  ];

  // ---------------------------------------------------------------- 1826
  // Dispatches from 200 years ago, in period tone but factually grounded.
  C.dispatches = [
    { date: "Jul. 4, 1826", place: "Monticello & Quincy",
      head: "Two Authors of Independence Depart, on the Self-Same Day",
      body: "On the fiftieth anniversary of the Declaration, Mr. Thomas Jefferson is dead at Monticello; and some hours later, unaware, Mr. John Adams expires at Quincy. His last reported words — 'Thomas Jefferson survives' — were, by then, no longer true. A coincidence so exact that men of reason scarce know whether to call it Providence or chance." },

    { date: "Spring, 1826", place: "Le Gras, near Chalon",
      head: "A View Caught and Held by the Sun Itself",
      body: "M. Nicéphore Niépce reports an image of the courtyard beyond his window, fixed upon a pewter plate coated in bitumen of Judea, by an exposure said to last the better part of a day. Where the painter's hand once was required, light now draws of its own accord. He names the art héliographie — sun-writing." },

    { date: "Feb. 23, 1826", place: "Kazan, Russia",
      head: "A Geometry Wherein the Parallels Fail",
      body: "Professor Lobachevsky lays before the university a system of geometry that abandons Euclid's troublesome fifth postulate, permitting many lines through a point to run parallel to a given line. The learned reception is cold. Yet if the demonstration holds, the very flatness of space is revealed to be a supposition, and not a necessity." },

    { date: "1826", place: "Christiania, Norway",
      head: "The Equation of the Fifth Degree Pronounced Insoluble",
      body: "A young Norwegian, Mr. Niels Abel, in a memoir of careful rigour, proves that the general equation of the fifth degree admits no solution by radicals — no formula of roots and powers, however ingenious, can ever exist. Three hundred years of searching are herewith ended by a proof that the thing sought was impossible from the first." },

    { date: "Mar. 21, 1826", place: "Vienna",
      head: "Herr Beethoven's Quartet Confounds the Players",
      body: "The new Quartet in B-flat was given, its closing fugue of such length and severity that the audience sat bewildered and the publisher has begged for a gentler finale. The composer, stone deaf, has consented to publish the great fugue apart. Some present declared it the raving of a sick man; a few suspect it the speech of one who hears what we cannot." },

    { date: "Apr. 1, 1826", place: "Orford, New Hampshire",
      head: "An Engine Driven by Burning Vapour",
      body: "Mr. Samuel Morey has obtained a patent for an engine moved not by steam but by the explosion of spirits of turpentine mixed with air, drawn into a cylinder and there ignited. Whether such internal fire can ever rival the steam-engine for steadiness remains in grave doubt, but the principle is sound and the curiosity considerable." },

    { date: "1826", place: "Paris",
      head: "M. Ampère Reduces Electric Force to Number",
      body: "In his Mathematical Theory of Electro-dynamic Phenomena, M. Ampère gives a law by which the force between two currents may be exactly computed from their strengths and arrangement. The mysterious sympathy between wires bearing a current is thus brought within the dominion of the calculus." },

    { date: "1826", place: "Cologne",
      head: "Herr Ohm Pursues the Measure of Galvanic Flow",
      body: "Reports reach us of a schoolmaster at Cologne who, by careful experiment with wires of differing length, holds that the current in a circuit stands in fixed proportion to the force that drives it, and in inverse proportion to the resistance of the conductor. If true, the galvanic current is no longer a caprice but a quantity, obedient to arithmetic." },

    { date: "1826", place: "London",
      head: "A University Without Test of Creed",
      body: "Subscriptions are opened for a new University in London, to admit students without inquiry into their religion — a thing the ancient colleges of Oxford and Cambridge have never suffered. Its founders intend instruction in the modern sciences and the living tongues. The design is bold, and not a little resented." },

    { date: "1826", place: "Regent's Park, London",
      head: "A Society for the Study of Living Animals",
      body: "Sir Stamford Raffles and Sir Humphry Davy have founded a Zoological Society, proposing a collection of beasts gathered not for the baiting-pit nor the menagerie's amusement, but for the sober advancement of natural knowledge. A garden to house them is contemplated in the northern parks." },

    { date: "1826", place: "Paris",
      head: "On the Temperature of the Terrestrial Globe",
      body: "M. Fourier, having already taught us how heat diffuses through a solid, now reasons upon the warmth of the Earth itself, and supposes the atmosphere to retain the sun's heat much as the glass of a gardener's frame retains it within. The Earth, he ventures, would be a far colder world were it stripped of its air." },

    { date: "1826", place: "New York",
      head: "Mr. Cooper's Tale of the Vanishing Frontier",
      body: "From the pen of Mr. James Fenimore Cooper comes 'The Last of the Mohicans,' a romance of the late French war set amidst the forests and falls of the northern wilderness. Readers find in it both a thrilling narrative and an elegy for a people and a forest alike receding before the settler's axe." },

    { date: "Aug. 1826", place: "Stettin",
      head: "A Boy of Seventeen Conjures a Summer Night",
      body: "Word arrives of an overture composed by young Felix Mendelssohn upon Herr Shakespeare's 'Midsummer Night's Dream,' wherein the violins are made to flit and shimmer like the fairy-folk themselves. That so finished a work should issue from one scarcely out of childhood is the wonder of the musical houses." },

    { date: "1826", place: "The High Seas",
      head: "Steam Ventures Upon the Open Ocean",
      body: "Vessels driven by paddle and furnace, hitherto confined to rivers and coasts, now attempt longer passages, though prudent captains carry full canvas still; the engine is a thirsty servant and the coal soon spent. The age when a ship may cross an ocean against the very wind is foreseen, if not yet quite arrived." },

    { date: "Winter, 1826", place: "The Almanack",
      head: "Of the Heavens This Season",
      body: "The patient observer is advised that Jupiter holds the evening sky, his four attendant moons discernible in a modest glass, shifting their stations from night to night as Galileo first remarked. The Pleiades ride high; and the careful eye may trace the faint nebulous patch in the sword of Orion, whose nature remains a matter of dispute among astronomers." },

    { date: "1826", place: "Edinburgh",
      head: "On the Folly of Hurry",
      body: "A correspondent observes that the new mail-coaches, thundering between the cities at the unnatural pace of ten miles in the hour, have bred in travellers a restlessness unknown to their fathers, who were content to arrive when the roads allowed. He wonders aloud what manner of nervous complaint so much haste shall in time produce. We print his letter without comment." },
  ];

  // ---------------------------------------------------------------- FEED
  // The empty feed's quiet murmurs. Nothing asks anything of you.
  C.murmurs = [
    "Nothing happened today. It was a good day.",
    "This is the part of the internet where you are allowed to do nothing.",
    "No one is waiting for your reply.",
    "You have scrolled far enough. There is no bottom, and that's fine.",
    "Somewhere, a kettle is just beginning to think about boiling.",
    "The number of things you must respond to right now is zero.",
    "This post has no comments and would like to keep it that way.",
    "Consider that the tab you're avoiding will still be there. Later is a real place.",
    "A slow breath in. A slower one out. That's the whole feature.",
    "There is no algorithm here. Only the part where you keep going down, gently.",
    "You are not behind on anything that matters.",
    "Light is travelling toward you from a star that no longer exists. No action needed.",
    "This is a quiet account. It posts the absence of news.",
    "Refresh if you like. It will sigh, and show you the same calm.",
    "The plant on your windowsill grew today by an amount too small to see.",
    "You may close this whenever you wish. It will not notice, and will not mind.",
    "Far below the surface, the deep water is perfectly still. It always is.",
    "Nobody has tagged you. Nobody is typing.",
    "Half the cells in your body will be replaced within a year. You're already someone new.",
    "This is permission, formatted as a post.",
    "The tide is going out somewhere, taking nothing of yours with it.",
    "There is no streak to maintain. Today does not count toward anything.",
    "An old forest is mostly fungus, shaking hands underground. Carry on.",
    "You've reached the part of the feed that was always meant for resting.",
  ];

  // tiny calm observations used as drifting nature notes
  C.nature = [
    "the moon is a comma in the sentence of the night",
    "moss measures time in centuries and is in no hurry",
    "a river is the same shape as a lightning bolt, slowed down",
    "snow falls at roughly one metre per second — the speed of a slow walk",
    "the smell after rain is a molecule called petrichor, made by soil bacteria",
    "every grain of sand on every beach is outnumbered by the stars",
    "a single oak can move forty thousand litres of water into the sky on a hot day",
    "the eye of a storm is the calmest place for a hundred miles",
  ];
})();
