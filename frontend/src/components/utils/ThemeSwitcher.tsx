import { useGlobal } from "@/contexts/GlobalContext";

export type Theme = "system" | "light" | "dark";

export default function ThemeSwitcher() {
  const { theme, setTheme } = useGlobal();

  return (
    <select
      value={theme}
      onChange={(e) => setTheme(e.target.value as Theme)}
      className="text-sm"
    >
      <option value="system">⚙️ Sistema</option>
      <option value="light">🌞 Chiaro</option>
      <option value="dark">🌙 Scuro</option>
    </select>
  );
}
