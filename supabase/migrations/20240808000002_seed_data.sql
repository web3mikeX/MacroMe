-- Insert sample ingredients (ignore duplicates)
insert into public.ingredients (name, unit, protein, carbs, fat, kcal) values
  ('Chicken Breast', 'g', 23.0, 0.0, 3.6, 165),
  ('Brown Rice', 'g', 2.6, 23.0, 0.9, 111),
  ('Broccoli', 'g', 2.8, 7.0, 0.4, 34),
  ('Olive Oil', 'ml', 0.0, 0.0, 100.0, 884),
  ('Sweet Potato', 'g', 2.0, 20.1, 0.1, 86),
  ('Salmon', 'g', 22.0, 0.0, 12.0, 206),
  ('Quinoa', 'g', 4.4, 22.0, 1.9, 120),
  ('Spinach', 'g', 2.9, 3.6, 0.4, 23),
  ('Greek Yogurt', 'g', 10.0, 3.6, 0.4, 59),
  ('Almonds', 'g', 21.0, 22.0, 50.0, 579),
  ('Oats', 'g', 13.2, 67.0, 6.5, 389),
  ('Banana', 'g', 1.1, 23.0, 0.3, 89),
  ('Eggs', 'piece', 13.0, 1.1, 11.0, 155),
  ('Avocado', 'g', 2.0, 9.0, 15.0, 160),
  ('Black Beans', 'g', 21.0, 63.0, 1.4, 341)
on conflict (name) do nothing;

-- Insert sample recipes
insert into public.recipes (name, steps, skill_level, default_servings) values
  (
    'Grilled Chicken with Brown Rice and Broccoli',
    '[
      {"order": 1, "text": "Preheat grill to medium-high heat", "time_s": 300},
      {"order": 2, "text": "Season chicken breast with salt, pepper, and herbs", "time_s": 120},
      {"order": 3, "text": "Rinse and cook brown rice according to package instructions", "time_s": 2700},
      {"order": 4, "text": "Steam broccoli until tender-crisp", "time_s": 300},
      {"order": 5, "text": "Grill chicken breast for 6-7 minutes per side until cooked through", "time_s": 840},
      {"order": 6, "text": "Let chicken rest for 5 minutes, then slice", "time_s": 300},
      {"order": 7, "text": "Serve chicken over rice with steamed broccoli", "time_s": 60}
    ]'::jsonb,
    'beginner',
    1
  ),
  (
    'Honey Garlic Salmon with Quinoa',
    '[
      {"order": 1, "text": "Rinse quinoa and cook according to package instructions", "time_s": 900},
      {"order": 2, "text": "Mix honey, garlic, soy sauce, and ginger for marinade", "time_s": 180},
      {"order": 3, "text": "Marinate salmon fillets for 15 minutes", "time_s": 900},
      {"order": 4, "text": "Heat olive oil in a pan over medium-high heat", "time_s": 120},
      {"order": 5, "text": "Cook salmon skin-side up for 4 minutes", "time_s": 240},
      {"order": 6, "text": "Flip and cook for another 3-4 minutes", "time_s": 210},
      {"order": 7, "text": "Serve salmon over quinoa with steamed vegetables", "time_s": 120}
    ]'::jsonb,
    'intermediate',
    1
  ),
  (
    'Greek Yogurt Breakfast Bowl',
    '[
      {"order": 1, "text": "Place Greek yogurt in a bowl", "time_s": 30},
      {"order": 2, "text": "Slice banana and add to bowl", "time_s": 60},
      {"order": 3, "text": "Sprinkle oats and chopped almonds on top", "time_s": 60},
      {"order": 4, "text": "Drizzle with honey if desired", "time_s": 30},
      {"order": 5, "text": "Add fresh berries if available", "time_s": 30}
    ]'::jsonb,
    'beginner',
    1
  ),
  (
    'Sweet Potato and Black Bean Bowl',
    '[
      {"order": 1, "text": "Preheat oven to 400°F (200°C)", "time_s": 300},
      {"order": 2, "text": "Cube sweet potatoes and toss with olive oil and spices", "time_s": 300},
      {"order": 3, "text": "Roast sweet potatoes for 25-30 minutes until tender", "time_s": 1800},
      {"order": 4, "text": "Heat black beans with cumin and garlic", "time_s": 300},
      {"order": 5, "text": "Sauté spinach until wilted", "time_s": 180},
      {"order": 6, "text": "Assemble bowl with sweet potatoes, beans, and spinach", "time_s": 120},
      {"order": 7, "text": "Top with sliced avocado", "time_s": 60}
    ]'::jsonb,
    'intermediate',
    1
  )
on conflict (name) do nothing;

-- Insert recipe ingredients relationships
insert into public.recipe_ingredients (recipe_id, ingredient_id, quantity, unit) values
  -- Grilled Chicken with Brown Rice and Broccoli
  ((select id from recipes where name = 'Grilled Chicken with Brown Rice and Broccoli'), (select id from ingredients where name = 'Chicken Breast'), 150, 'g'),
  ((select id from recipes where name = 'Grilled Chicken with Brown Rice and Broccoli'), (select id from ingredients where name = 'Brown Rice'), 80, 'g'),
  ((select id from recipes where name = 'Grilled Chicken with Brown Rice and Broccoli'), (select id from ingredients where name = 'Broccoli'), 100, 'g'),
  ((select id from recipes where name = 'Grilled Chicken with Brown Rice and Broccoli'), (select id from ingredients where name = 'Olive Oil'), 10, 'ml'),
  
  -- Honey Garlic Salmon with Quinoa
  ((select id from recipes where name = 'Honey Garlic Salmon with Quinoa'), (select id from ingredients where name = 'Salmon'), 150, 'g'),
  ((select id from recipes where name = 'Honey Garlic Salmon with Quinoa'), (select id from ingredients where name = 'Quinoa'), 80, 'g'),
  ((select id from recipes where name = 'Honey Garlic Salmon with Quinoa'), (select id from ingredients where name = 'Olive Oil'), 10, 'ml'),
  
  -- Greek Yogurt Breakfast Bowl
  ((select id from recipes where name = 'Greek Yogurt Breakfast Bowl'), (select id from ingredients where name = 'Greek Yogurt'), 200, 'g'),
  ((select id from recipes where name = 'Greek Yogurt Breakfast Bowl'), (select id from ingredients where name = 'Banana'), 100, 'g'),
  ((select id from recipes where name = 'Greek Yogurt Breakfast Bowl'), (select id from ingredients where name = 'Oats'), 30, 'g'),
  ((select id from recipes where name = 'Greek Yogurt Breakfast Bowl'), (select id from ingredients where name = 'Almonds'), 20, 'g'),
  
  -- Sweet Potato and Black Bean Bowl
  ((select id from recipes where name = 'Sweet Potato and Black Bean Bowl'), (select id from ingredients where name = 'Sweet Potato'), 200, 'g'),
  ((select id from recipes where name = 'Sweet Potato and Black Bean Bowl'), (select id from ingredients where name = 'Black Beans'), 100, 'g'),
  ((select id from recipes where name = 'Sweet Potato and Black Bean Bowl'), (select id from ingredients where name = 'Spinach'), 50, 'g'),
  ((select id from recipes where name = 'Sweet Potato and Black Bean Bowl'), (select id from ingredients where name = 'Avocado'), 50, 'g'),
  ((select id from recipes where name = 'Sweet Potato and Black Bean Bowl'), (select id from ingredients where name = 'Olive Oil'), 15, 'ml')
on conflict (recipe_id, ingredient_id) do nothing;