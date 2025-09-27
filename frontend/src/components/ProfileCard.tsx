import { useUser } from "../../user.store";

export default function ProfileCard() {
  const me = useUser();
  if (!me) return null;

  return (
    <div className="p-4 rounded-xl border">
      <div className="font-medium mb-3">Ваш профиль</div>

      <div className="flex items-center gap-3">
        {me.photoUrl ? (
          <img
            src={me.photoUrl}
            alt="Avatar"
            className="w-14 h-14 rounded-full object-cover"
            referrerPolicy="no-referrer"
            onError={(e) => {
              (e.currentTarget as HTMLImageElement).style.display = "none";
            }}
          />
        ) : (
          <div className="w-14 h-14 rounded-full bg-gray-200" />
        )}

        <div className="text-sm leading-6">
          <div>
            <b>ID:</b> {me.tgId}
          </div>
          <div>
            <b>Имя:</b>{" "}
            {[me.firstName, me.lastName].filter(Boolean).join(" ") || "—"}
          </div>
          <div>
            <b>Username:</b> {me.username ? `@${me.username}` : "—"}
          </div>
          <div>
            <b>Язык:</b> {me.language || "—"}
          </div>
          <div>
            <b>Premium:</b> {me.isPremium ? "да" : "нет/н/д"}
          </div>
        </div>
      </div>
    </div>
  );
}
