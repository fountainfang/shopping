export type VenueInfo = {
    id: string; // matches the 'venue' param we use (bolshoi, mariinsky, etc.)
    names: {
        en: string;
        zh: string;
        ru: string;
    };
    descriptions: {
        en: string;
        zh: string;
        ru: string;
    };
    image?: string;
}

export const VENUES: Record<string, VenueInfo> = {
    bolshoi: {
        id: 'bolshoi',
        names: {
            en: "Bolshoi Theatre",
            zh: "莫斯科大剧院",
            ru: "Большой театр"
        },
        descriptions: {
            en: "The Bolshoi Theatre is a historic theatre in Moscow, Russia, designed by architect Joseph Bové, which holds ballet and opera performances. It is one of the most renowned and significant theatres in the world.",
            zh: "莫斯科大剧院（Bolshoi Theatre）是俄罗斯莫斯科的历史性剧院，由建筑师约瑟夫·波维设计，主要上演芭蕾舞和歌剧。它是世界上最著名和最重要的剧院之一。",
            ru: "Большой театр — исторический театр в Москве, Россия, построенный по проекту архитектора Осипа Бове, в котором проходят балетные и оперные спектакли. Один из самых значительных театров в мире."
        }
    },
    mariinsky: {
        id: 'mariinsky',
        names: {
            en: "Mariinsky Theatre",
            zh: "马林斯基剧院",
            ru: "Мариинский театр"
        },
        descriptions: {
            en: "The Mariinsky Theatre is a historic theatre of opera and ballet in Saint Petersburg, Russia. Opened in 1860, it became the preeminent music theatre of late 19th-century Russia.",
            zh: "马林斯基剧院（Mariinsky Theatre）是俄罗斯圣彼得堡的一座历史悠久的歌剧和芭蕾舞剧院。它于1860年开业，成为19世纪晚期俄罗斯杰出的音乐剧院。",
            ru: "Мариинский театр — исторический театр оперы и балета в Санкт-Петербурге, Россия. Открытый в 1860 году, он стал выдающимся музыкальным театром России конца XIX века."
        }
    },
    hermitage: {
        id: 'hermitage',
        names: {
            en: "State Hermitage Museum",
            zh: "国立埃尔米塔日博物馆",
            ru: "Государственный Эрмитаж"
        },
        descriptions: {
            en: "The State Hermitage Museum is a museum of art and culture in Saint Petersburg, Russia. It is the second-largest art museum in the world.",
            zh: "国立埃尔米塔日博物馆（冬宫）是俄罗斯圣彼得堡的艺术和文化博物馆。它是世界上第二大艺术博物馆。",
            ru: "Государственный Эрмитаж — музей изобразительного и декоративно-прикладного искусства, расположенный в Санкт-Петербурге. Второй по величине художественный музей в мире."
        }
    }
}
