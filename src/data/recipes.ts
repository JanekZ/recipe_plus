export interface Recipe {
    image: string
    name: string
    description: string
    tag: string
    cookingTime: number
    portions: number
    author: string
    isPublic: boolean
}

export const recipes: Recipe[] = [
    {
        image: 'https://placehold.co/400x300/F17939/white?text=Pizza+Margherita',
        name: 'Pizza Margherita',
        description: 'Klasyczna włoska pizza z sosem pomidorowym, mozzarellą i świeżą bazylią.',
        tag: 'pizza',
        cookingTime: 30,
        portions: 4,
        author: 'placeholder',
        isPublic: true
    },
    {
        image: 'https://placehold.co/400x300/FF9F6C/white?text=Pancakes',
        name: 'Pancakes z Syropem Klonowym',
        description: 'Puszyste naleśniki podawane z masłem i naturalnym syropem klonowym.',
        tag: 'deser',
        cookingTime: 20,
        portions: 2,
        author: 'placeholder',
        isPublic: true
    },
    {
        image: 'https://placehold.co/400x300/F17939/white?text=Spaghetti',
        name: 'Spaghetti Carbonara',
        description: 'Kremowy makaron z jajkiem, parmezanem, guanciale i czarnym pieprzem.',
        tag: 'makaron',
        cookingTime: 25,
        portions: 3,
        author: 'placeholder',
        isPublic: true
    },
    {
        image: 'https://placehold.co/400x300/FF9F6C/white?text=Sałatka',
        name: 'Sałatka Greecka',
        description: 'Świeże warzywa z fetą, oliwkami i sosem na bazie oliwy z oliwek.',
        tag: 'sałatka',
        cookingTime: 15,
        portions: 2,
        author: 'placeholder',
        isPublic: true
    },
    {
        image: 'https://placehold.co/400x300/F17939/white?text=Burgery',
        name: 'Burger Wołowy',
        description: 'Soczysty kotlet wołowy z serem cheddar, sałatą i pomidorem w bułce brioche.',
        tag: 'burger',
        cookingTime: 35,
        portions: 4,
        author: 'placeholder',
        isPublic: true
    },
    {
        image: 'https://placehold.co/400x300/FF9F6C/white?text=Tiramisu',
        name: 'Tiramisu',
        description: 'Deser z warstw nasączonych kawą biszkoptów, kremu mascarpone i kakao.',
        tag: 'deser',
        cookingTime: 40,
        portions: 6,
        author: 'placeholder',
        isPublic: true
    }
]
