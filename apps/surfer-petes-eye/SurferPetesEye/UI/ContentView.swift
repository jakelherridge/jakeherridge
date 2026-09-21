import SwiftUI

struct ContentView: View {
    @State private var session = PeteSession()
    @Environment(\.scenePhase) private var scenePhase

    var body: some View {
        Group {
            switch session.permission {
            case .granted:
                CameraScreen(session: session)
            case .undetermined:
                PermissionView(mode: .ask) {
                    Task { await session.start() }
                }
            case .denied:
                PermissionView(mode: .denied) {
                    session.openSettings()
                }
            }
        }
        .preferredColorScheme(.dark)
        .statusBarHidden(true)
        .task { await session.start() }
        .onChange(of: scenePhase) { _, phase in
            switch phase {
            case .active: session.resume()
            case .background: session.pause()
            default: break
            }
        }
    }
}
