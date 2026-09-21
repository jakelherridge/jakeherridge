import XCTest
@testable import SurferPetesEye

final class PeteLexiconTests: XCTestCase {

    func testEveryDrinkIsHappyJuice() {
        XCTAssertEqual(PeteLexicon.translate("bottle"), "happy juice")
        XCTAssertEqual(PeteLexicon.translate("wine glass"), "fancy happy juice")
        XCTAssertTrue(PeteLexicon.translate("cup").contains("happy juice"))
        XCTAssertTrue(PeteLexicon.isHappyJuice("bottle"))
        XCTAssertTrue(PeteLexicon.isHappyJuice("cup"))
    }

    func testWordRulesCatchSceneClassifierLabels() {
        XCTAssertEqual(PeteLexicon.translate("beer"), "happy juice")
        XCTAssertEqual(PeteLexicon.translate("coffee cup"), "happy juice")
        XCTAssertTrue(PeteLexicon.isHappyJuice("cocktail"))
        XCTAssertFalse(PeteLexicon.isHappyJuice("sunglasses"))
    }

    func testTableBeatsWordRules() {
        // "hot dog" contains "dog" but Pete knows a hot dog when he sees one.
        XCTAssertEqual(PeteLexicon.translate("hot dog"), "tube grub")
        XCTAssertEqual(PeteLexicon.translate("Hot_Dog"), "tube grub")
    }

    func testTheStick() {
        XCTAssertTrue(PeteLexicon.isTheStick("surfboard"))
        XCTAssertTrue(PeteLexicon.names(for: "surfboard").contains("THE STICK"))
        XCTAssertFalse(PeteLexicon.isTheStick("skateboard"))
    }

    func testUnknownThingsStillGetANameFromPete() {
        let name = PeteLexicon.translate("flux capacitor")
        XCTAssertFalse(name.isEmpty)
        XCTAssertTrue(PeteLexicon.unknownNames.contains(name))
    }

    func testSeedPicksAStableVariant() {
        XCTAssertEqual(PeteLexicon.translate("person", seed: 5), PeteLexicon.translate("person", seed: 5))
        let variants = Set((0..<4).map { PeteLexicon.translate("person", seed: $0) })
        XCTAssertEqual(variants.count, 4)
    }

    func testAliasLabelsFromOtherModels() {
        XCTAssertEqual(PeteLexicon.translate("tvmonitor"), "the box of lies")
        XCTAssertEqual(PeteLexicon.translate("pottedplant", seed: 0), PeteLexicon.translate("potted plant", seed: 0))
    }
}
