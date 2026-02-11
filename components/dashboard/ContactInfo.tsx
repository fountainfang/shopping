import Link from "next/link";

export default function ContactInfo() {
    const socialLinks = [
        {
            name: "Telegram",
            url: "https://t.me/monsterasme",
            icon: "ri-telegram-line",
            label: "电报",
        },
        {
            name: "WeChat",
            url: "./assets/img/1706572858344.jpg",
            icon: "ri-wechat-line",
            label: "微信",
        },
        {
            name: "Discord",
            url: "https://discord.gg/6VFzy2wR",
            icon: "ri-discord-line",
            label: "Discord",
        },
        {
            name: "Email",
            url: "mailto:teterussia@icloud.com",
            icon: "ri-mail-line",
            label: "邮件",
        },
        {
            name: "GitHub",
            url: "https://github.com/fountainfang",
            icon: "ri-github-fill",
            label: "Github",
        },
        {
            name: "Xiaohongshu",
            url: "https://www.xiaohongshu.com/user/profile/5817940e82ec391d91b6a638",
            icon: "ri-registered-line", // approximations if specific brand icons missing in older sets, checking if available
            label: "小红书",
        },
        {
            name: "Taobao",
            url: "https://item.taobao.com/item.htm?id=768415457380",
            icon: "ri-taobao-line",
            label: "淘宝",
        },
    ];

    return (
        <div className="mt-8 pt-8 border-t border-border">
            <h3 className="text-lg font-semibold mb-4">Contact Support</h3>
            <div className="flex flex-wrap gap-4">
                {socialLinks.map((link) => (
                    <Link
                        key={link.name}
                        href={link.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 px-4 py-2 rounded-lg bg-card/50 border border-border/50 hover:bg-primary/10 hover:border-primary/30 hover:text-primary transition-all duration-300 group"
                    >
                        <i className={`${link.icon} text-xl group-hover:scale-110 transition-transform`} />
                        <span className="font-medium text-sm">{link.label}</span>
                        <i className="ri-arrow-right-up-line text-xs opacity-50 group-hover:opacity-100 transition-opacity" />
                    </Link>
                ))}
            </div>
        </div>
    );
}
