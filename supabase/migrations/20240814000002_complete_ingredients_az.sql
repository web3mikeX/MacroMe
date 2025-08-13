-- MacroMe Complete A-Z Ingredients Database
-- Adds comprehensive ingredients list with accurate nutritional data (per 100g)

insert into public.ingredients (name, unit, protein, carbs, fat, kcal) values
  -- A
  ('Apples', 'g', 0.3, 14.0, 0.2, 52),
  ('Artichoke', 'g', 3.3, 11.0, 0.2, 47),
  ('Asparagus', 'g', 2.2, 3.9, 0.1, 20),
  ('Arugula', 'g', 2.6, 3.7, 0.7, 25),
  
  -- B
  ('Beef Ground 85/15', 'g', 25.0, 0.0, 15.0, 250),
  ('Bell Peppers Red', 'g', 1.0, 7.0, 0.3, 31),
  ('Bell Peppers Green', 'g', 0.9, 4.6, 0.2, 20),
  ('Blueberries', 'g', 0.7, 14.5, 0.3, 57),
  ('Brussels Sprouts', 'g', 3.4, 8.9, 0.3, 43),
  ('Butternut Squash', 'g', 1.0, 12.0, 0.1, 45),
  
  -- C
  ('Cauliflower', 'g', 1.9, 5.0, 0.3, 25),
  ('Carrots', 'g', 0.9, 10.0, 0.2, 41),
  ('Celery', 'g', 0.7, 3.0, 0.2, 14),
  ('Chia Seeds', 'g', 17.0, 42.0, 31.0, 486),
  ('Chickpeas', 'g', 19.0, 61.0, 6.0, 364),
  ('Coconut Oil', 'ml', 0.0, 0.0, 100.0, 862),
  ('Cottage Cheese', 'g', 11.0, 3.4, 4.3, 98),
  ('Cucumber', 'g', 0.7, 3.6, 0.1, 16),
  
  -- D
  ('Dates', 'g', 1.8, 75.0, 0.2, 277),
  ('Duck Breast', 'g', 23.5, 0.0, 13.8, 237),
  
  -- E
  ('Eggplant', 'g', 1.0, 6.0, 0.2, 25),
  ('Edamame', 'g', 11.9, 8.9, 5.2, 121),
  
  -- F
  ('Flax Seeds', 'g', 18.3, 29.0, 42.0, 534),
  ('Feta Cheese', 'g', 14.2, 4.1, 21.3, 264),
  
  -- G
  ('Garlic', 'g', 6.4, 33.0, 0.5, 149),
  ('Ginger', 'g', 1.8, 18.0, 0.8, 80),
  ('Grapefruit', 'g', 0.8, 11.0, 0.1, 42),
  ('Green Beans', 'g', 1.8, 7.0, 0.1, 31),
  ('Ground Turkey', 'g', 27.0, 0.0, 8.0, 189),
  
  -- H
  ('Halibut', 'g', 23.0, 0.0, 2.3, 111),
  ('Hemp Seeds', 'g', 31.0, 8.7, 49.0, 553),
  ('Honey', 'g', 0.3, 82.0, 0.0, 304),
  
  -- I
  ('Ice Berg Lettuce', 'g', 0.9, 3.0, 0.1, 14),
  
  -- J
  ('Jalapeño Peppers', 'g', 0.9, 6.5, 0.4, 29),
  
  -- K
  ('Kale', 'g', 4.3, 8.8, 0.9, 49),
  ('Kidney Beans', 'g', 24.0, 60.0, 0.8, 333),
  ('Kiwi', 'g', 1.1, 15.0, 0.5, 61),
  
  -- L
  ('Lamb Leg', 'g', 25.6, 0.0, 16.5, 258),
  ('Lemons', 'g', 1.1, 9.0, 0.3, 29),
  ('Lentils Red', 'g', 24.0, 60.0, 1.5, 352),
  ('Limes', 'g', 0.7, 11.0, 0.2, 30),
  ('Lobster', 'g', 19.0, 1.3, 0.9, 89),
  
  -- M
  ('Mango', 'g', 0.8, 15.0, 0.4, 60),
  ('Mushrooms Button', 'g', 3.1, 3.3, 0.3, 22),
  ('Mozzarella Cheese', 'g', 22.2, 2.2, 22.4, 300),
  ('Mackerel', 'g', 25.7, 0.0, 13.9, 231),
  
  -- N
  ('Navy Beans', 'g', 22.3, 60.8, 1.5, 337),
  ('Nectarines', 'g', 1.1, 11.0, 0.3, 44),
  ('Nori Seaweed', 'g', 5.8, 5.1, 0.3, 35),
  
  -- O
  ('Onions', 'g', 1.1, 9.3, 0.1, 40),
  ('Oranges', 'g', 0.9, 12.0, 0.1, 47),
  ('Oysters', 'g', 9.0, 4.9, 2.3, 68),
  
  -- P
  ('Parsley', 'g', 3.0, 6.3, 0.8, 36),
  ('Pears', 'g', 0.4, 15.0, 0.1, 57),
  ('Pineapple', 'g', 0.5, 13.0, 0.1, 50),
  ('Pork Tenderloin', 'g', 26.9, 0.0, 3.7, 143),
  ('Potatoes', 'g', 2.0, 17.0, 0.1, 77),
  ('Pumpkin Seeds', 'g', 19.0, 54.0, 19.0, 446),
  
  -- Q
  ('Quail Eggs', 'piece', 13.1, 0.4, 11.1, 158),
  
  -- R
  ('Radishes', 'g', 0.7, 2.0, 0.1, 16),
  ('Raspberries', 'g', 1.2, 12.0, 0.7, 52),
  ('Rice White', 'g', 2.7, 28.0, 0.3, 130),
  ('Romaine Lettuce', 'g', 1.2, 3.3, 0.3, 17),
  
  -- S
  ('Sardines', 'g', 25.0, 0.0, 11.5, 208),
  ('Scallops', 'g', 15.0, 2.8, 0.8, 69),
  ('Strawberries', 'g', 0.7, 7.7, 0.3, 32),
  ('Sunflower Seeds', 'g', 21.0, 20.0, 51.0, 584),
  ('Swiss Chard', 'g', 1.8, 3.7, 0.2, 19),
  
  -- T
  ('Tofu Firm', 'g', 15.7, 4.3, 8.7, 144),
  ('Tomatoes', 'g', 0.9, 3.9, 0.2, 18),
  ('Tuna', 'g', 25.0, 0.0, 1.0, 109),
  ('Turkey Breast', 'g', 24.0, 0.0, 1.0, 104),
  ('Turnips', 'g', 0.9, 6.4, 0.1, 28),
  
  -- U
  ('Udon Noodles', 'g', 2.6, 21.0, 0.4, 99),
  
  -- V
  ('Vanilla Extract', 'ml', 0.1, 1.6, 0.0, 12),
  ('Venison', 'g', 30.2, 0.0, 2.4, 158),
  
  -- W
  ('Walnuts', 'g', 15.2, 13.7, 65.2, 654),
  ('Watercress', 'g', 2.3, 1.3, 0.1, 11),
  ('Watermelon', 'g', 0.6, 7.6, 0.2, 30),
  ('Wheat Berries', 'g', 13.2, 71.2, 2.5, 339),
  ('White Fish', 'g', 19.8, 0.0, 1.3, 92),
  
  -- X
  ('Xanthan Gum', 'g', 0.0, 0.0, 0.0, 0),
  
  -- Y
  ('Yellow Squash', 'g', 1.2, 4.0, 0.2, 20),
  ('Yams', 'g', 1.5, 27.9, 0.2, 118),
  ('Yogurt Plain', 'g', 10.0, 3.6, 0.4, 59),
  
  -- Z
  ('Zucchini', 'g', 1.2, 3.1, 0.3, 17),
  ('Zucchini Noodles', 'g', 1.2, 3.1, 0.3, 17)
on conflict (name) do nothing;

-- Additional common cooking ingredients and pantry staples
insert into public.ingredients (name, unit, protein, carbs, fat, kcal) values
  -- Spices and Seasonings (minimal macros but important for cooking)
  ('Salt', 'g', 0.0, 0.0, 0.0, 0),
  ('Black Pepper', 'g', 10.9, 64.8, 3.3, 251),
  ('Paprika', 'g', 14.1, 54.0, 13.0, 282),
  ('Cumin', 'g', 17.8, 44.2, 22.3, 375),
  ('Oregano', 'g', 9.0, 69.0, 4.3, 265),
  ('Basil', 'g', 3.2, 2.6, 0.6, 22),
  ('Thyme', 'g', 5.6, 45.3, 7.4, 276),
  ('Rosemary', 'g', 3.3, 64.1, 5.9, 331),
  ('Cinnamon', 'g', 4.0, 81.0, 1.2, 247),
  ('Turmeric', 'g', 7.8, 65.0, 9.9, 354),
  
  -- Common Oils and Fats
  ('Butter', 'g', 0.9, 0.1, 81.1, 717),
  ('Coconut Milk', 'ml', 5.5, 6.4, 24.0, 230),
  ('Avocado Oil', 'ml', 0.0, 0.0, 100.0, 884),
  ('Sesame Oil', 'ml', 0.0, 0.0, 100.0, 884),
  
  -- Vinegars and Acids
  ('Apple Cider Vinegar', 'ml', 0.0, 0.9, 0.0, 22),
  ('Balsamic Vinegar', 'ml', 0.5, 17.0, 0.0, 88),
  ('White Wine Vinegar', 'ml', 0.0, 0.0, 0.0, 19),
  ('Lemon Juice', 'ml', 0.4, 6.9, 0.2, 22),
  ('Lime Juice', 'ml', 0.4, 8.4, 0.2, 25),
  
  -- Dairy and Alternatives
  ('Milk Whole', 'ml', 3.2, 4.8, 3.2, 61),
  ('Milk Almond', 'ml', 0.6, 0.6, 1.1, 17),
  ('Milk Oat', 'ml', 1.0, 6.7, 1.5, 47),
  ('Heavy Cream', 'ml', 2.1, 2.8, 37.0, 345),
  ('Sour Cream', 'g', 2.4, 4.6, 20.0, 193),
  ('Cream Cheese', 'g', 5.9, 4.1, 34.2, 342),
  ('Ricotta Cheese', 'g', 11.4, 3.0, 13.0, 174),
  ('Parmesan Cheese', 'g', 35.8, 4.1, 25.8, 392),
  ('Cheddar Cheese', 'g', 25.0, 1.3, 33.0, 403),
  
  -- Grains and Starches
  ('Pasta Whole Wheat', 'g', 13.0, 72.0, 2.5, 348),
  ('Pasta White', 'g', 11.0, 74.0, 1.1, 351),
  ('Bread Whole Wheat', 'slice', 4.0, 17.0, 1.9, 81),
  ('Bread White', 'slice', 2.6, 14.0, 1.0, 75),
  ('Tortilla Whole Wheat', 'piece', 3.0, 15.0, 2.5, 80),
  ('Couscous', 'g', 12.8, 72.4, 1.8, 376),
  ('Barley', 'g', 12.5, 73.5, 2.3, 354),
  ('Buckwheat', 'g', 13.3, 71.5, 3.4, 343),
  
  -- Legumes and Pulses
  ('Pinto Beans', 'g', 21.4, 62.6, 1.2, 347),
  ('Lima Beans', 'g', 21.5, 63.4, 0.7, 338),
  ('Green Peas', 'g', 5.4, 14.5, 0.4, 81),
  ('Split Peas', 'g', 25.4, 60.4, 1.2, 352),
  
  -- Nuts and Seeds (additional)
  ('Cashews', 'g', 18.2, 30.2, 43.9, 553),
  ('Pecans', 'g', 9.2, 13.9, 72.0, 691),
  ('Pistachios', 'g', 20.2, 27.2, 45.3, 560),
  ('Brazil Nuts', 'g', 14.3, 12.3, 67.1, 659),
  ('Macadamia Nuts', 'g', 7.9, 13.8, 75.8, 718),
  ('Pine Nuts', 'g', 13.7, 13.1, 68.4, 673),
  ('Sesame Seeds', 'g', 17.7, 23.4, 49.7, 573),
  ('Poppy Seeds', 'g', 18.0, 28.1, 41.6, 525),
  
  -- Sweeteners
  ('Maple Syrup', 'ml', 0.0, 67.0, 0.2, 260),
  ('Agave Nectar', 'ml', 0.1, 76.4, 0.0, 310),
  ('Stevia', 'g', 0.0, 0.0, 0.0, 0),
  ('Brown Sugar', 'g', 0.0, 97.0, 0.0, 380),
  ('White Sugar', 'g', 0.0, 100.0, 0.0, 387),
  
  -- Proteins
  ('Protein Powder Whey', 'scoop', 25.0, 3.0, 1.0, 120),
  ('Protein Powder Plant', 'scoop', 20.0, 5.0, 2.0, 110),
  ('Tempeh', 'g', 19.0, 9.4, 11.4, 192),
  ('Seitan', 'g', 25.0, 14.0, 1.9, 370),
  
  -- Seafood (additional)
  ('Shrimp', 'g', 24.0, 0.2, 0.3, 99),
  ('Crab', 'g', 18.1, 0.0, 1.5, 87),
  ('Mussels', 'g', 18.0, 4.7, 2.2, 86),
  ('Clams', 'g', 15.5, 5.1, 2.0, 86),
  ('Cod', 'g', 18.0, 0.0, 0.7, 82),
  ('Tilapia', 'g', 20.1, 0.0, 1.7, 96),
  ('Mahi Mahi', 'g', 20.2, 0.0, 0.8, 85)
on conflict (name) do nothing;