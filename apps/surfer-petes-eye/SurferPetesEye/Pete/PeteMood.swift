import SwiftUI
import simd

/// Pete's world has weather. Each mood is a palette for the shader, a
/// strength for the sun, and how hard the world warps. Named for the
/// island: the surf break at Gregory Town, the calm Bight side, the capital
/// at golden hour, crab hunting after dark, and the reef that eats ships.
enum PeteMood: String, CaseIterable, Identifiable {
    case dawnPatrol = "Dawn Patrol"
    case glassy = "Glassy Bight"
    case goldenHour = "Governor's Gold"
    case nightSesh = "Crab Walk"
    case wipeout = "Devil's Backbone"

    var id: String { rawValue }

    var tagline: String {
        switch self {
        case .dawnPatrol: return "Dawn patrol at Surfer's. Nobody out. Perfect."
        case .glassy: return "Bight side. Glassy, brah. Look at it."
        case .goldenHour: return "Governor's Harbour gold. Every hour."
        case .nightSesh: return "Crab walk. Torch on. The colors come out."
        case .wipeout: return "Devil's Backbone. Head went thump. All good."
        }
    }

    var systemImage: String {
        switch self {
        case .dawnPatrol: return "sunrise.fill"
        case .glassy: return "water.waves"
        case .goldenHour: return "sun.max.fill"
        case .nightSesh: return "flashlight.on.fill"
        case .wipeout: return "tornado"
        }
    }

    /// A, B feed the wave bands; C, D feed the neon edges.
    var palette: (SIMD4<Float>, SIMD4<Float>, SIMD4<Float>, SIMD4<Float>) {
        switch self {
        case .dawnPatrol:
            return (SIMD4(1.00, 0.45, 0.60, 1), SIMD4(1.00, 0.75, 0.45, 1), SIMD4(0.70, 0.55, 1.00, 1), SIMD4(1.00, 0.85, 0.40, 1))
        case .glassy:
            return (SIMD4(0.10, 0.85, 0.80, 1), SIMD4(0.10, 0.35, 0.90, 1), SIMD4(0.95, 1.00, 1.00, 1), SIMD4(1.00, 0.80, 0.30, 1))
        case .goldenHour:
            return (SIMD4(1.00, 0.55, 0.15, 1), SIMD4(0.95, 0.20, 0.60, 1), SIMD4(1.00, 0.90, 0.40, 1), SIMD4(0.50, 0.20, 0.80, 1))
        case .nightSesh:
            return (SIMD4(1.00, 0.10, 0.60, 1), SIMD4(0.10, 0.50, 1.00, 1), SIMD4(0.30, 1.00, 0.50, 1), SIMD4(0.60, 0.20, 1.00, 1))
        case .wipeout:
            return (SIMD4(1.00, 0.15, 0.15, 1), SIMD4(1.00, 1.00, 1.00, 1), SIMD4(0.20, 1.00, 1.00, 1), SIMD4(1.00, 1.00, 0.20, 1))
        }
    }

    var sunWarmth: Float {
        switch self {
        case .dawnPatrol: return 0.7
        case .glassy: return 0.6
        case .goldenHour: return 1.0
        case .nightSesh: return 0.25
        case .wipeout: return 0.8
        }
    }

    var sunGlow: Float {
        switch self {
        case .dawnPatrol: return 0.9
        case .glassy: return 1.0
        case .goldenHour: return 1.2
        case .nightSesh: return 0.6
        case .wipeout: return 1.0
        }
    }

    var kaleido: Float { self == .wipeout ? 0.85 : 0 }

    var drift: Float {
        switch self {
        case .dawnPatrol: return 0.9
        case .glassy: return 1.0
        case .goldenHour: return 1.0
        case .nightSesh: return 1.1
        case .wipeout: return 1.8
        }
    }

    /// Tint for regions Pete has named (happy juice overrides this with gold).
    var hotspotTint: SIMD4<Float> {
        let p = palette
        return SIMD4(p.2.x, p.2.y, p.2.z, 0.7)
    }

    /// Color for tags and controls.
    var accent: Color {
        let c = palette.3
        return Color(red: Double(c.x), green: Double(c.y), blue: Double(c.z))
    }

    var next: PeteMood {
        let all = Self.allCases
        let index = all.firstIndex(of: self) ?? 0
        return all[(index + 1) % all.count]
    }

    static func forHour(_ hour: Int) -> PeteMood {
        switch hour {
        case 5..<9: return .dawnPatrol
        case 9..<16: return .glassy
        case 16..<20: return .goldenHour
        default: return .nightSesh
        }
    }

    static func forNow(_ date: Date = Date(), calendar: Calendar = .current) -> PeteMood {
        forHour(calendar.component(.hour, from: date))
    }
}
