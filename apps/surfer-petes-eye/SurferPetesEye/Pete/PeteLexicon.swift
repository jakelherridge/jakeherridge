import Foundation

/// What Pete calls things. The model speaks COCO; Pete speaks Pete, with
/// a good amount of Bahamian in it after a few decades on Eleuthera.
///
/// Several names per thing so a room full of chairs is not a room full of
/// "the throne". A sighting picks one name by its seed and keeps it.
enum PeteLexicon {

    /// A few things Pete reacts to out loud. See PeteSayings.onSighting.
    enum Kind {
        case potcake, fish, boat, other
    }

    static let table: [String: [String]] = [
        // people and animals
        "person": ["brah", "bey", "a fellow soul", "grom"],
        "bird": ["sky buddy", "a gull with opinions"],
        "cat": ["the boss", "a small landlord"],
        "dog": ["potcake", "the good potcake"],
        "horse": ["a big potcake"],
        "sheep": ["a cloud with legs"],
        "cow": ["a moo boat"],
        "elephant": ["a gray mountain with a hose"],
        "bear": ["the furry landlord"],
        "zebra": ["a striped horse, obviously"],
        "giraffe": ["a tall fella"],

        // things that move
        "bicycle": ["a two-wheel wave"],
        "car": ["land boat", "a land boat"],
        "motorcycle": ["an angry land boat"],
        "motorbike": ["an angry land boat"],
        "airplane": ["the Nassau bird"],
        "aeroplane": ["the Nassau bird"],
        "bus": ["the jitney"],
        "train": ["an iron snake"],
        "truck": ["the island truck, most of one"],
        "boat": ["the real deal", "a boat, respect", "the Spanish Wells express"],

        // street
        "traffic light": ["a disco light"],
        "fire hydrant": ["a little red gnome"],
        "stop sign": ["a big red suggestion"],
        "parking meter": ["a coin goblin"],
        "bench": ["the perch"],

        // carry
        "backpack": ["a turtle shell"],
        "umbrella": ["portable shade", "a casuarina you can carry"],
        "handbag": ["a treasure sack"],
        "tie": ["a neck leash"],
        "suitcase": ["the escape box"],

        // play
        "frisbee": ["a flying plate"],
        "skis": ["snow sticks"],
        "snowboard": ["the cold stick"],
        "sports ball": ["the orb", "an orb of stoke"],
        "kite": ["a sky dancer"],
        "baseball bat": ["a whack stick"],
        "baseball glove": ["a catch hand"],
        "skateboard": ["a sidewalk surfboard"],
        "surfboard": ["THE STICK", "the magic plank", "my old friend"],
        "fishing rod": ["the patient way"],
        "tennis racket": ["a fly swatter"],

        // happy juice and its vessels
        "bottle": ["happy juice"],
        "wine glass": ["fancy happy juice"],
        "wineglass": ["fancy happy juice"],
        "cup": ["happy juice", "a mug of happy juice", "sky juice, maybe"],

        // kitchen
        "fork": ["a tiny trident"],
        "knife": ["a sharp"],
        "spoon": ["a little shovel"],
        "bowl": ["the crater"],
        "banana": ["a yellow smile"],
        "apple": ["a crunch ball"],
        "sandwich": ["the stack"],
        "orange": ["a sun ball"],
        "pineapple": ["Gregory Town gold"],
        "broccoli": ["a tiny tree"],
        "carrot": ["an orange stick"],
        "hot dog": ["tube grub"],
        "pizza": ["the wheel"],
        "donut": ["a sugar tire"],
        "cake": ["a party brick"],

        // home
        "chair": ["the throne"],
        "couch": ["the big soft"],
        "sofa": ["the big soft"],
        "potted plant": ["buddy", "a green friend"],
        "pottedplant": ["buddy", "a green friend"],
        "bed": ["the hammock, basically"],
        "dining table": ["the flat rock"],
        "diningtable": ["the flat rock"],
        "toilet": ["the porcelain wave"],
        "tv": ["the box of lies"],
        "tvmonitor": ["the box of lies"],
        "laptop": ["the glow book"],
        "mouse": ["the little guy"],
        "remote": ["the wand"],
        "keyboard": ["a clicky slab"],
        "cell phone": ["a pocket portal"],
        "microwave": ["the hum box"],
        "oven": ["the hot box"],
        "toaster": ["a bread tanner"],
        "sink": ["a tiny lagoon"],
        "refrigerator": ["the happy juice cave", "the cooler that hums"],
        "book": ["a paper brick"],
        "clock": ["the tyrant", "the rooster's cousin"],
        "vase": ["a flower boat"],
        "scissors": ["the snippers"],
        "teddy bear": ["the soft one"],
        "hair drier": ["a wind machine"],
        "hair dryer": ["a wind machine"],
        "toothbrush": ["a chomper scrubber"],
    ]

    /// Word rules for labels outside the table. Apple's scene classifier
    /// speaks a much bigger language than COCO. First rule that matches a
    /// whole word wins.
    static let wordRules: [(words: [String], names: [String])] = [
        (["beer", "wine", "cocktail", "coffee", "drink", "drinks", "beverage", "juice", "soda", "mug",
          "glass", "bottle", "cup", "champagne", "liquor", "whiskey", "rum", "margarita", "latte", "espresso"],
         ["happy juice", "happy juice", "a Kalik, probably"]),
        (["coconut", "coconuts"], ["sky juice, almost"]),
        (["ocean", "sea", "wave", "waves", "surf", "surfing", "beach", "coast", "shore", "tide", "reef", "lagoon"],
         ["the big blue", "home", "the whole point", "the Bight, or the loud side"]),
        (["sun", "sunset", "sunrise", "sky"], ["the big warm", "golden hour, always", "the Eleuthera light"]),
        (["dog", "puppy"], ["potcake", "the good potcake"]),
        (["cat", "kitten"], ["the boss", "a small landlord"]),
        (["bird", "seagull", "gull", "pelican", "heron", "hummingbird"], ["sky buddy", "a gull with opinions"]),
        (["chicken", "rooster", "hen"], ["the alarm clock"]),
        (["goat"], ["the lawn mower"]),
        (["lizard", "iguana", "gecko"], ["the landlord"]),
        (["fish", "grouper", "snapper", "lobster", "crawfish", "conch"], ["a swimmer", "dinner, if he's slow"]),
        (["crab"], ["a crab, he knows things"]),
        (["pineapple"], ["Gregory Town gold"]),
        (["car", "vehicle", "truck", "van", "cart"], ["land boat"]),
        (["surfboard", "board"], ["THE STICK", "the magic plank"]),
        (["palm", "palms", "pine", "pines"], ["a buddy that whispers"]),
        (["tree", "plant", "flower", "flowers", "garden", "forest"], ["a green friend", "buddy"]),
        (["shed", "hut", "cabin", "shack", "cottage"], ["home, brah"]),
        (["hammock"], ["the office"]),
        (["food", "meal", "snack", "pizza", "burger", "sandwich", "taco", "fries"], ["grindage", "fuel for the stoke"]),
        (["water", "pool", "lake", "river"], ["baby ocean", "practice water"]),
        (["phone", "screen", "computer", "laptop", "monitor"], ["the glow slab", "a pocket portal"]),
        (["people", "crowd", "person", "man", "woman", "child", "kid", "face", "baby"], ["brah", "bey", "a fellow soul", "grom"]),
        (["sand"], ["the good stuff", "pink, if you squint"]),
        (["cloud", "clouds"], ["sky foam"]),
        (["mountain", "hill", "mountains"], ["a wave that forgot to break"]),
        (["night", "dark"], ["crab walk hours"]),
        (["rain", "storm"], ["crab weather"]),
        (["indoor", "room", "furniture", "wall", "kitchen", "bedroom"], ["the cave"]),
        (["outdoor", "nature", "landscape", "outdoors"], ["out there, brah"]),
    ]

    static let unknownNames = ["a tingum", "one of them tingums", "a whatsit", "a real one", "a good one, probably"]

    static func normalize(_ label: String) -> String {
        label.lowercased()
            .replacingOccurrences(of: "_", with: " ")
            .replacingOccurrences(of: "-", with: " ")
            .trimmingCharacters(in: .whitespacesAndNewlines)
    }

    static func names(for label: String) -> [String] {
        let key = normalize(label)
        if let names = table[key] {
            return names
        }
        let words = Set(key.split(whereSeparator: { $0 == " " || $0 == "," }).map(String.init))
        for rule in wordRules where !words.isDisjoint(with: rule.words) {
            return rule.names
        }
        return unknownNames
    }

    /// One stable name for a label. Same seed, same name, every frame.
    static func translate(_ label: String, seed: Int = 0) -> String {
        let options = names(for: label)
        return options[abs(seed) % options.count]
    }

    static func isHappyJuice(_ label: String) -> Bool {
        names(for: label).contains { $0.contains("happy juice") }
    }

    static func isTheStick(_ label: String) -> Bool {
        names(for: label).contains { $0 == "THE STICK" }
    }

    static func kind(of label: String) -> Kind {
        let options = names(for: label)
        if options.contains(where: { $0.contains("potcake") }) { return .potcake }
        if options.contains("a swimmer") { return .fish }
        if options.contains("the real deal") { return .boat }
        return .other
    }
}
