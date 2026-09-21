import Foundation

/// What Pete calls things. The model speaks COCO; Pete speaks Pete.
///
/// Several names per thing so a room full of chairs is not a room full of
/// "the throne". A sighting picks one name by its seed and keeps it.
enum PeteLexicon {

    static let table: [String: [String]] = [
        // people and animals
        "person": ["brah", "a fellow soul", "grom", "a legend"],
        "bird": ["sky buddy", "a feathered grom"],
        "cat": ["the boss", "a small landlord"],
        "dog": ["land seal", "the good boy"],
        "horse": ["a big dog"],
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
        "airplane": ["a sky whale"],
        "aeroplane": ["a sky whale"],
        "bus": ["the big land boat"],
        "train": ["an iron snake"],
        "truck": ["the hauler"],
        "boat": ["the real deal", "a boat, respect"],

        // street
        "traffic light": ["a disco light"],
        "fire hydrant": ["a little red gnome"],
        "stop sign": ["a big red suggestion"],
        "parking meter": ["a coin goblin"],
        "bench": ["the perch"],

        // carry
        "backpack": ["a turtle shell"],
        "umbrella": ["portable shade"],
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
        "tennis racket": ["a fly swatter"],

        // happy juice and its vessels
        "bottle": ["happy juice"],
        "wine glass": ["fancy happy juice"],
        "wineglass": ["fancy happy juice"],
        "cup": ["happy juice", "a mug of happy juice"],

        // kitchen
        "fork": ["a tiny trident"],
        "knife": ["a sharp"],
        "spoon": ["a little shovel"],
        "bowl": ["the crater"],
        "banana": ["a yellow smile"],
        "apple": ["a crunch ball"],
        "sandwich": ["the stack"],
        "orange": ["a sun ball"],
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
        "bed": ["the raft"],
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
        "refrigerator": ["the happy juice cave"],
        "book": ["a paper brick"],
        "clock": ["the tyrant"],
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
          "glass", "bottle", "cup", "champagne", "liquor", "whiskey", "margarita", "latte", "espresso"],
         ["happy juice"]),
        (["ocean", "sea", "wave", "waves", "surf", "surfing", "beach", "coast", "shore", "tide"],
         ["the big blue", "home", "the whole point"]),
        (["sun", "sunset", "sunrise", "sky"], ["the big warm", "golden hour, always"]),
        (["dog", "puppy"], ["land seal", "the good boy"]),
        (["cat", "kitten"], ["the boss", "a small landlord"]),
        (["bird", "seagull", "gull", "pelican"], ["sky buddy", "a feathered grom"]),
        (["fish"], ["a swimmer", "a wet friend"]),
        (["crab"], ["a crab, he knows things"]),
        (["car", "vehicle", "truck", "van"], ["land boat"]),
        (["surfboard", "board"], ["THE STICK", "the magic plank"]),
        (["tree", "plant", "flower", "flowers", "garden", "forest", "palm"], ["a green friend", "buddy"]),
        (["food", "meal", "snack", "pizza", "burger", "sandwich", "taco", "fries"], ["grindage", "fuel for the stoke"]),
        (["water", "pool", "lake", "river"], ["baby ocean", "practice water"]),
        (["phone", "screen", "computer", "laptop", "monitor"], ["the glow slab", "a pocket portal"]),
        (["people", "crowd", "person", "man", "woman", "child", "kid", "face", "baby"], ["brah", "a fellow soul", "grom"]),
        (["sand"], ["the good stuff"]),
        (["cloud", "clouds"], ["sky foam"]),
        (["mountain", "hill", "mountains"], ["a wave that forgot to break"]),
        (["night", "dark"], ["the night sesh"]),
        (["indoor", "room", "furniture", "wall", "kitchen", "bedroom"], ["the cave"]),
        (["outdoor", "nature", "landscape", "outdoors"], ["out there, brah"]),
    ]

    static let unknownNames = ["a something", "one of those", "a whatsit", "a real one", "a good one, probably"]

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
}
