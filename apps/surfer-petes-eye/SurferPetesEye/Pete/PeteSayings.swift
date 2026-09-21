import Foundation

/// Pete talks. Not a lot, but always.
///
/// The lore, in one breath: Pete was a huge, jacked, ladies-man surfer in
/// the eighties. He has had a few head wounds. He is ninety now and lives
/// in a little shed on Eleuthera in the Bahamas, spears his own fish with
/// a Hawaiian sling, hunts land crabs at night with a torch, and enjoys
/// life exactly as much as he did then. Every line should be kind, short,
/// and a little bit sideways. He never explains. He names.
enum PeteSayings {

    // MARK: The lines

    static let shedLife: [String] = [
        "Shed's got one hammock and one window. Window's the good one.",
        "Rain on a tin roof is the best music after rake 'n' scrape.",
        "Queen's Highway. One road. Can't get lost. I do anyway.",
        "Mail boat's Thursday. Everything's Thursday if you wait.",
        "Curly-tail lizard's the landlord. I pay in crumbs.",
        "Pines whisper. I whisper back. We got an arrangement.",
        "Rooster's the alarm clock. Nobody set him. Nobody can.",
        "Sand flies at dusk. That's the toll. Sunset's worth it.",
        "Boil fish and johnny cake and I'm twenty-five again till noon.",
        "Island's small. Sip sip travels faster than the mail boat.",
        "Power's out. Stars are on. Fair trade.",
    ]

    static let fishAndCrabs: [String] = [
        "Sling and a snorkel. That's the whole grocery store.",
        "Grouper knows my name. Won't say it.",
        "Speared a hogfish this morning. He was fair about it.",
        "Rain came. Crabs walk tonight. Bring the torch.",
        "Crab in a bucket is dinner. Crab on the beach is a friend. Depends on the bucket.",
        "Lionfish don't belong here. Neither did I. One of us got speared.",
        "Conch salad fixes the head. Conch horn fixes the heart.",
        "Ocean Hole at Rock Sound goes clean through to the sea. Fish come up to say hi.",
        "Crabs know things.",
        "Be nice to the crabs. They were here first.",
        "Never trust a flat ocean or a quiet potcake.",
    ]

    static let island: [String] = [
        "Eleuthera. Means free. I checked. Twice.",
        "Two blues at Glass Window. Deep one's angry, shallow one's fine. I'm the bridge.",
        "Surfer's Beach, December, north swell. Nobody out but me and a potcake.",
        "Sand's pink on Harbour Island. Little shells did that. Took a while.",
        "Devil's Backbone ate a hundred ships. Still hungry. Respect.",
        "Sun comes up on the loud side, goes down on the quiet side. Same sun.",
        "Pineapples in Gregory Town taste like the sun got tired and lay down.",
        "Spanish Wells boys bring the crawfish. I bring the appetite.",
        "Friday fish fry at Governor's. Bring a chair. Lose the chair.",
        "Preacher's Cave. First folks here washed up on the reef. Tradition.",
        "Junkanoo at two in the morning. Cowbells. My knees did their best.",
        "Current Cut will take you somewhere. Just say yes.",
    ]

    static let happyJuiceLore: [String] = [
        "Kalik's just happy juice with a hat on.",
        "Sky juice. Gin, coconut water, a little sweet milk. The clouds drink it too.",
        "The sun is just a big happy juice in the sky.",
        "Goombay smash. It does what it says.",
    ]

    static let backInTheDay: [String] = [
        "Back in '84 I had arms like coconuts and the judgment of a coconut.",
        "I was built like a fridge. Full of happy juice too.",
        "The ladies loved me. I loved me more. We were all wrong.",
        "Bench pressed a jet ski once. Different times. Dumber times.",
        "Muscles went. Stoke stayed. Good trade.",
        "Hit my head a lot. Regret nothing. Remember less.",
        "Colors got louder after '87.",
        "Lost my marbles at Surfer's Beach. They're still out there.",
        "Used to be jacked. Now I'm hooked. Same tan, different fish.",
        "1983. Best year of my life. Don't remember it.",
    ]

    static let philosophy: [String] = [
        "Every wave is a love letter, brah.",
        "You're glowing. Everyone's glowing. It's fine.",
        "Salt water fixes most stuff.",
        "If it's not moving, wait. It will.",
        "Everything's a wave if you squint.",
        "The board knows the way. You're just along for it.",
        "Sunshine's free, bey. Take a lot.",
        "This is the good part. It's all the good part.",
        "Ninety years old and the water's still warm.",
        "I don't remember your name but I remember your vibe.",
        "Well muddo. Look at that.",
    ]

    /// Everything Pete mutters when nothing in particular is happening.
    static let ambient: [String] = shedLife + fishAndCrabs + island + happyJuiceLore + backInTheDay + philosophy

    // MARK: Reactions

    static let happyJuice = [
        "Happy juice! Cheers, bey.",
        "Happy juice spotted. Day's looking up.",
        "Is that happy juice? That's happy juice.",
        "Kalik o'clock.",
    ]

    static let theStick = [
        "THE STICK. My old friend.",
        "There she is. The magic plank.",
        "North swell's coming. She knows.",
    ]

    static let potcake = [
        "Potcake! Good boy. Good boy.",
        "Every potcake on this island knows my shed.",
    ]

    static let fish = [
        "Dinner, if he's slow.",
        "Swimmer. Respect the swimmer.",
    ]

    static let boat = [
        "Somebody's going to Spanish Wells.",
        "Boat. Real one. Respect.",
    ]

    static let crab = [
        "A crab! Crabs know things.",
        "Crab, bey. Show respect.",
        "Little sideways buddy.",
        "Rain came. Crabs walk tonight.",
    ]

    static let shaka = [
        "HANG LOOSE.",
        "Shaka, brah. Shaka.",
        "That's the spirit.",
    ]

    static let peace = [
        "Peace, brah.",
        "Two fingers, all the love.",
    ]

    static let openPalm = [
        "High five to the universe.",
        "Wave back. It's polite.",
    ]

    static let snapshot = [
        "Framed it, brah.",
        "That one's a keeper.",
        "Got it. Mostly.",
        "Mail boat can take that one to Nassau.",
    ]

    static let snapshotFailed = [
        "Couldn't keep that one. Story of my life.",
    ]

    // MARK: Picking

    static func pick(_ lines: [String], excluding last: String? = nil) -> String {
        let candidates = lines.filter { $0 != last }
        return (candidates.isEmpty ? lines : candidates).randomElement() ?? ""
    }

    static func onSighting(_ sighting: Sighting) -> String? {
        if sighting.isHappyJuice { return pick(happyJuice) }
        if PeteLexicon.isTheStick(sighting.label) { return pick(theStick) }
        switch PeteLexicon.kind(of: sighting.label) {
        case .potcake: return pick(potcake)
        case .fish: return pick(fish)
        case .boat: return pick(boat)
        case .other: return nil
        }
    }

    static func onGesture(_ gesture: Gesture) -> String {
        switch gesture {
        case .crabPinch: return pick(crab)
        case .shaka: return pick(shaka)
        case .peace: return pick(peace)
        case .openPalm: return pick(openPalm)
        }
    }
}
