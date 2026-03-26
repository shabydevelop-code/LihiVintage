/**
 * Lihi Vintage - Product Catalog Data
 * 
 * --- מדריך לעדכון פריטים בליהי וינטג' ---
 * 1. כל פריט מתחיל ומסתיים בסוגריים מסולסלים: { ... }
 * 2. חשוב לשים פסיק ( , ) בין כל פריט לפריט ברשימה.
 * 3. id: מספר מזהה ייחודי (חייב להיות שונה עבור כל פריט).
 * 4. active: מצב הפעלה (true = מוצג באתר, false = מוסתר).
 * 5. category: נשים (women), גברים (men), אביזרים (accessories).
 * 6. sub: חולצות (tops), מכנסיים (bottoms), מעילים (outerwear).
 * 7. image: קישור לתמונה (חייבת להיות בתיקיית images).
 */

const products = [
    {
        id: 1,
        active: false,
        title: "מעיל טרנץ' וינטג' משנות ה-70",
        category: "women",
        sub: "outerwear",
        categoryName: "נשים",
        subName: "מעילים",
        price: 320,
        image: "images/photo-1591047139829-d91aecb6caea.jpg",
        size: "M"
    },
    {
        id: 2,
        active: true,
        title: "צעיף משי קלאסי - הדפס זהב",
        category: "accessories",
        sub: "tops",
        categoryName: "אביזרים",
        subName: "חולצות/אביזרים",
        price: 85,
        image: "images/photo-1601924994987-69e26d50dc26.jpg",
        size: "One Size"
    },
    {
        id: 3,
        active: true,
        title: "מכנסי קורדרוי רטרו",
        category: "men",
        sub: "bottoms",
        categoryName: "גברים",
        subName: "מכנסיים",
        price: 180,
        image: "images/photo-1594633312681-425c7b97ccd1.jpg",
        size: "32"
    },
    {
        id: 4,
        active: true,
        title: "ז'קט דנים וינטג'",
        category: "men",
        sub: "outerwear",
        categoryName: "גברים",
        subName: "מעילים",
        price: 240,
        image: "images/photo-1551028719-00167b16eac5.jpg",
        size: "L"
    },
    {
        id: 5,
        active: true,
        title: "חולצת תחרה ויקטוריאנית - שמנת",
        category: "women",
        sub: "tops",
        categoryName: "נשים",
        subName: "חולצות",
        price: 125,
        image: "images/photo-1515886657613-9f3515b0c78f.jpg",
        size: "S"
    },
    {
        id: 6,
        active: true,
        title: "חצאית משובצת גזרה גבוהה",
        category: "women",
        sub: "bottoms",
        categoryName: "נשים",
        subName: "מכנסיים/חצאיות",
        price: 95,
        image: "images/photo-1583337130417-3346a1be7dee.jpg",
        size: "S/M"
    },
    {
        id: 7,
        active: true,
        title: "תיק סאטשל מעור",
        category: "accessories",
        sub: "bottoms",
        categoryName: "אביזרים",
        subName: "תיקים",
        price: 210,
        image: "images/photo-1548036328-c9fa89d128fa.jpg",
        size: "L"
    },
    {
        id: 8,
        active: true,
        title: "סוודר סרוג רטרו",
        category: "men",
        sub: "tops",
        categoryName: "גברים",
        subName: "חולצות",
        price: 155,
        image: "images/photo-1434389677669-e08b4cac3105.jpg",
        size: "L"
    },
    {
        id: 9,
        active: true,
        title: "שמלת מקסי פרחונית בוהו",
        category: "women",
        sub: "tops",
        categoryName: "נשים",
        subName: "שמלות",
        price: 245,
        image: "images/photo-1617339847948-7b36b2008611.jpg",
        size: "S"
    },
    {
        id: 10,
        active: true,
        title: "מכנס דנים קצר גזרה גבוהה",
        category: "women",
        sub: "bottoms",
        categoryName: "נשים",
        subName: "מכנסיים",
        price: 120,
        image: "images/photo-1591195853828-11db59a44f6b.jpg",
        size: "S"
    },
    {
        id: 11,
        active: true,
        title: "חולצה רטרו עם דפוס",
        category: "men",
        sub: "tops",
        categoryName: "גברים",
        subName: "חולצות",
        price: 165,
        image: "images/photo-1633972659388-6ab963e95f3d.jpg",
        size: "L"
    },
    {
        id: 12,
        active: true,
        title: "ז'קט שדה קנבס",
        category: "men",
        sub: "outerwear",
        categoryName: "גברים",
        subName: "מעילים",
        price: 310,
        image: "images/photo-1659539954675-c780f120b11a.jpg",
        size: "XL"
    },
    {
        id: 13,
        active: true,
        title: "שרשרת חוליות מוזהבת",
        category: "accessories",
        sub: "tops",
        categoryName: "אביזרים",
        subName: "תכשיטים",
        price: 75,
        image: "images/photo-1599643478518-a784e5dc4c8f.jpg",
        size: "One Size"
    },
    {
        id: 14,
        active: true,
        title: "כומתת צמר וינטג'",
        category: "accessories",
        sub: "tops",
        categoryName: "אביזרים",
        subName: "כובעים",
        price: 90,
        image: "images/photo-1699795877766-9caea1e4a01c.jpg",
        size: "One Size"
    }
];
