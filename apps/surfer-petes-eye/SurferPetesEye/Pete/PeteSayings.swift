import Foundation

/// Pete talks. Not a lot, but always.
enum PeteSayings {

    static let ambient: [String] = [
        "Every wave is a love letter, brah.",
        "1983. Best year of my life. Don't remember it.",
        "The sun is just a big happy juice in the sky.",
        "Crabs know things.",
        "Hit my head a lot. Regret nothing.",
        "You're glowing. Everyone's glowing. It's fine.",
        "Salt water fixes most stuff.",
        "If it's not moving, wait. It will.",
        "Colors got louder after '87.",
        "Never trust a flat ocean or a quiet dog.",
        "Everything's a wave if you squint.",
        "Lost my marbles at Trestles. They're still out there.",
        "Be nice to the crabs. They were here first.",
        "The board knows the way. You're just along for it.",
        "Sunshine's free, brah. Take a lot.",
        "This is the good part. It's all the good part.",
        "Ninety years old and the water's still warm.",
        "I don't remember your name but I remember your vibe.",
    ]

    static let happyJuice = [
        "Happy juice! Cheers, brah.",
        "Happy juice spotted. Day's looking up.",
        "Is that happy juice? That's happy juice.",
    ]

    static let theStick = [
        "THE STICK. My old friend.",
        "There she is. The magic plank.",
    ]

    static let crab = [
        "A crab! Crabs know things.",
        "Crab, brah. Show respect.",
        "Little sideways buddy.",
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
    ]

    static let snapshotFailed = [
        "Couldn't keep that one. Story of my life.",
    ]

    static func pick(_ lines: [String], excluding last: String? = nil) -> String {
        let candidates = lines.filter { $0 != last }
        return (candidates.isEmpty ? lines : candidates).randomElement() ?? ""
    }

    static func onSighting(_ sighting: Sighting) -> String? {
        if sighting.isHappyJuice { return pick(happyJuice) }
        if PeteLexicon.isTheStick(sighting.label) { return pick(theStick) }
        return nil
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
