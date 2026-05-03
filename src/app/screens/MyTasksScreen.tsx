import { MyTasks } from "./TaskHub";

const FONT = `-apple-system, BlinkMacSystemFont, 'SF Pro Display', 'SF Pro Text', 'Inter', 'Helvetica Neue', sans-serif`;

export function MyTasksScreen() {
  return (
    <div className="min-h-full px-4 pt-6 pb-4 flex flex-col gap-4">
      {/* Header */}
      <div>
        <p style={{ color: "#4DA6FF", fontSize: 11, letterSpacing: 2, fontFamily: FONT, marginBottom: 2 }}>
          DANH SÁCH NHIỆM VỤ
        </p>
        <h1 style={{ color: "#fff", fontSize: 22, fontWeight: 700, letterSpacing: -0.5, fontFamily: FONT }}>
          Task của tôi
        </h1>
      </div>

      <MyTasks />
    </div>
  );
}
