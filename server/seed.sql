-- =============================================================================
-- Perfume Zone (perfumezone.uk) - PostgreSQL Seed Data Script
-- =============================================================================
-- Run after server/schema.sql:
--   psql -U postgres -d perfumezone -f server/seed.sql
-- =============================================================================

-- -----------------------------------------------------------------------------
-- 1. Seed Collections
-- -----------------------------------------------------------------------------
INSERT INTO collections (handle, title, description) VALUES
  ('all', 'All Fragrances', 'Explore our complete library of authentic luxury Arabian perfumes, rare Oud, and artisan extraits at Perfume Zone UK.'),
  ('new-in', 'New In & Latest Releases', 'The freshest creations and new season arrivals from the prestigious perfume houses of Dubai and Europe.'),
  ('best-sellers', 'Best Sellers Collection', 'Our most coveted and acclaimed signature perfumes, loved by fragrance connoisseurs across the UK.'),
  ('fragrance-sets', 'Fragrance Discovery & Gift Sets', 'Curated luxury discovery sets, travel atomisers, and bespoke gift presentations.'),
  ('last-chance', 'Last Chance & Limited Reductions', 'Rare flacons and final quantities of limited edition luxury extraits at special pricing.'),
  ('womens', 'Women''s Fragrances', 'Sensual floral, gourmand vanilla, sweet fruits, and delicate musks crafted for her.'),
  ('mens', 'Men''s Fragrances', 'Assertive woody, smoky oud, fresh citrus, and spicy leathers crafted for him.'),
  ('unisex', 'Unisex Fragrances', 'Captivating compositions that transcend boundaries—amber, agarwood, tonka bean, and spiced florals.'),
  ('extrait-de-parfum', 'Extrait De Parfum (Pure Perfume)', 'The highest concentration in high perfumery (25%–40% oil) for unrivaled 16-hour sillage.'),
  ('perfume-oils', 'Concentrated Perfume Oils (Attar)', 'Alcohol-free, pure artisan perfume oils crafted for direct pulse point application.'),
  ('deodorants', 'Luxury Perfumed Deodorants', 'Long-lasting scented body sprays infused with genuine Arabian perfume notes.'),
  ('air-freshners', 'Air & Room Fresheners (Home & Linen)', 'Luxury Arabian room sprays and atmospheric mists to scent your living spaces.'),
  ('oud-1', 'Precious Oud & Agarwood', 'Rich, smokey Cambodian, Indian, and Arabian agarwoods blended with rose and amber.'),
  ('amber', 'Warm & Golden Amber', 'Resinous, warm, and radiant amber accords with hints of sweet vanilla and balsam.'),
  ('gourmand', 'Sweet Gourmand Accords', 'Decadent blends of roasted praline, dates, vanilla bean, cinnamon, and creamy tonka.'),
  ('woody', 'Noble Woods & Vetiver', 'Earthy cedarwood, sandalwood, vetiver, and smoky frankincense.'),
  ('fruity-1', 'Fruity & Citrus Accords', 'Lively bergamot, fresh apple, ripe plum, and vibrant citrus nuances.'),
  ('floral', 'Sensual Floral Bouquets', 'Taif rose, velvet jasmine, white iris, and exotic lilies from Grasse and the East.'),
  ('summer-fragrances', 'Summer Fragrance Wardrobe', 'Crisp, aquatic, sparkling citrus and airy green tea scents for sunlit days.'),
  ('spring-collection', 'Spring Collection Wardrobe', 'Dewy petals, soft white musks, and uplifting floral-woody harmonies.'),
  ('autumn', 'Autumn Fragrance Wardrobe', 'Cozy spices, golden amber, roasted nuts, and warm balsamic undertones.'),
  ('winter', 'Winter Fragrance Wardrobe', 'Deep, enveloping oud, dark roses, sweet vanilla, and intoxicating boozy accords.'),
  ('everyday-fragrances', 'Everyday Fragrances', 'Versatile, refined scents designed for professional elegance and daily wear.'),
  ('evening-fragrances', 'Evening & Special Occasion Fragrances', 'Opulent, memorable scents formulated to make an indelible impression after dusk.'),
  ('oud-elixir', 'Oud Elixir Dubai', 'Royal bespoke extraits formulated with pure aged agarwood oils and regal resins.'),
  ('essential-perfume', 'Essential Perfume Paris & Dubai', 'Artisanal high-concentration compositions honoring classical perfumery traditions.'),
  ('blends-of-dubai', 'Blends of Dubai', 'Evocative scents inspired by the majestic dunes and opulent souks of Dubai.'),
  ('viali', 'Viali Milano & London', 'Ultra-concentrated perfume oils and modern niche extraits crafted for understated luxury.'),
  ('afnan', 'Afnan Perfumes', 'Masters of contemporary luxury, unmatched sillage, and viral modern sensations.'),
  ('rayhaan', 'Rayhaan Fragrances', 'Bold, masculine, and sophisticated fragrances crafted for modern leaders.'),
  ('swiss-arabian', 'Swiss Arabian', 'Heritage perfumery dating back to 1974, harmonizing European finesse with Arabian soul.'),
  ('gulf-orchid', 'Gulf Orchid Perfumery', 'Sweet, gourmand, and floral creations celebrating royal Arabian hospitality.'),
  ('zimaya', 'Zimaya Parfums', 'Niche-quality Extrait creations capturing rare accords and captivating drydowns.'),
  ('rue-broca', 'Rue Broca Paris', 'French refinement meets oriental richness in distinctively packaged bottles.'),
  ('lattafa', 'Lattafa Luxury Perfumes', 'Trendsetting creators of world-famous oriental scents including Khamrah and Yara.'),
  ('ajmal', 'Ajmal Perfumes', 'Over 70 years of legendary oud mastery, royal attars, and niche compositions.'),
  ('rasasi', 'Rasasi Perfumes', 'Celebrated worldwide for iconic fragrances including Hawas, Shuhrah, and La Yuqawam.'),
  ('ard-al-zaafaran', 'Ard Al Zaafaran', 'Prestigious Arabian creations famed for exquisite floral-amber bouquets.')
ON CONFLICT (handle) DO UPDATE SET
  title = EXCLUDED.title,
  description = EXCLUDED.description;

-- -----------------------------------------------------------------------------
-- 2. Seed Products (24 Complete Luxury Products with Olfactory Notes)
-- -----------------------------------------------------------------------------
INSERT INTO products (
  handle, title, brand, price, compare_at_price,
  image_url, image_url_2, description, size, collections, notes, in_stock
) VALUES
(
  'oud-elixir-dubai-oud-intense',
  'Oud Elixir Dubai Oud Intense',
  'Oud Elixir',
  65.00, 85.00,
  'https://images.unsplash.com/photo-1594035910387-fea47794261f?auto=format&fit=crop&w=800&q=80',
  'https://images.unsplash.com/photo-1547887537-6158d64c35b3?auto=format&fit=crop&w=800&q=80',
  'An opulent, regal blend of pure Cambodian oud, smokey incense, dark Bulgarian rose, and warm amber. Crafted for discerning connoisseurs who seek unrivaled projection and sillage.',
  '100ml Extrait De Parfum',
  'new-in|best-sellers|oud-elixir|oud-1|extrait-de-parfum|evening-fragrances|unisex',
  '{"top": "Saffron, Bergamot, Nutmeg", "middle": "Bulgarian Rose, Cambodian Oud, Labdanum", "base": "Ambergris, Musk, Smoked Leather"}'::jsonb,
  1
),
(
  'afnan-supremacy-in-heaven',
  'Afnan Supremacy In Heaven',
  'Afnan',
  45.00, 55.00,
  'https://images.unsplash.com/photo-1523293182086-7651a899d37f?auto=format&fit=crop&w=800&q=80',
  'https://images.unsplash.com/photo-1592945403244-b3fbafd7f539?auto=format&fit=crop&w=800&q=80',
  'A crisp, exhilarating composition capturing the essence of fresh mountain air. Sparkling citrus and green tea harmonise with a subtle wood and musk foundation.',
  '100ml Eau De Parfum',
  'new-in|afnan|mens|everyday-fragrances|summer-fragrances',
  '{"top": "Bergamot, Mandarin Orange", "middle": "Green Tea, Blackcurrant", "base": "Musk, Sandalwood, Wood Notes"}'::jsonb,
  1
),
(
  'swiss-arabian-shaghaf-oud',
  'Swiss Arabian Shaghaf Oud',
  'Swiss Arabian',
  39.50, 49.00,
  'https://images.unsplash.com/photo-1588405748880-12d1d2a59f75?auto=format&fit=crop&w=800&q=80',
  'https://images.unsplash.com/photo-1616949755610-8c9bbc08f138?auto=format&fit=crop&w=800&q=80',
  'An iconic oriental gourmand fragrance that envelops you in passion. Sweet praline, velvety rose, and precious agarwood melt into golden vanilla and amber.',
  '75ml Eau De Parfum',
  'best-sellers|swiss-arabian|gourmand|oud-1|winter|unisex',
  '{"top": "Saffron", "middle": "Rose, Agarwood (Oud), Praline", "base": "Vanilla, Amber, Oud"}'::jsonb,
  1
),
(
  'lattafa-khamrah',
  'Lattafa Khamrah Luxury Edition',
  'Lattafa',
  42.00, 52.00,
  'https://images.unsplash.com/photo-1595425970377-c9703cf48b6d?auto=format&fit=crop&w=800&q=80',
  'https://images.unsplash.com/photo-1541643600914-78b084683601?auto=format&fit=crop&w=800&q=80',
  'A sumptuous warm spicy masterpiece infused with sweet dates, cinnamon, roasted tonka bean, and creamy vanilla. Presented in an exquisite crystal-cut decanter bottle.',
  '100ml Eau De Parfum',
  'new-in|best-sellers|lattafa|gourmand|amber|evening-fragrances|unisex',
  '{"top": "Cinnamon, Nutmeg, Bergamot", "middle": "Dates, Praline, Tuberose, Mahonial", "base": "Vanilla, Tonka Bean, Benzoin, Myrrh, Akigalawood"}'::jsonb,
  1
),
(
  'zimaya-sharaf-blend',
  'Zimaya Sharaf Blend',
  'Zimaya',
  36.00, 45.00,
  'https://images.unsplash.com/photo-1547887537-6158d64c35b3?auto=format&fit=crop&w=800&q=80',
  'https://images.unsplash.com/photo-1594035910387-fea47794261f?auto=format&fit=crop&w=800&q=80',
  'Indulgent, seductive, and irresistibly intoxicating. Notes of dates, cognac aroma, and spiced vanilla create a rich and opulent aura that lasts through the night.',
  '100ml Extrait De Parfum',
  'zimaya|gourmand|amber|autumn|winter|unisex|new-in',
  '{"top": "Dates, Nutmeg, Cinnamon", "middle": "Vanilla, Praline, Tuberose", "base": "Tonka Bean, Benzoin, Amberwood"}'::jsonb,
  1
),
(
  'rayhaan-elixir-imperial',
  'Rayhaan Elixir Imperial',
  'Rayhaan',
  38.00, 48.00,
  'https://images.unsplash.com/photo-1563178406-4cdc2923acbc?auto=format&fit=crop&w=800&q=80',
  'https://images.unsplash.com/photo-1523293182086-7651a899d37f?auto=format&fit=crop&w=800&q=80',
  'An assertive and modern masculine statement with aromatic lavender, fresh mint, spicy cinnamon, and a seductive base of vanilla and dark woods.',
  '100ml Eau De Parfum',
  'rayhaan|mens|everyday-fragrances|woody|spring-collection',
  '{"top": "Mint, Bergamot, Cardamom", "middle": "Lavender, Cinnamon, Cumin", "base": "Vanilla, Amber, Tonka Bean, Cedarwood"}'::jsonb,
  1
),
(
  'ajmal-amber-wood',
  'Ajmal Amber Wood Signature Collection',
  'Ajmal',
  89.00, 110.00,
  'https://images.unsplash.com/photo-1592945403244-b3fbafd7f539?auto=format&fit=crop&w=800&q=80',
  'https://images.unsplash.com/photo-1588405748880-12d1d2a59f75?auto=format&fit=crop&w=800&q=80',
  'A crown jewel in niche perfumery. Each drop is deep, multifaceted and layered with white pepper, cardamom, luxurious cedarwood, and radiant golden amber.',
  '100ml Eau De Parfum',
  'ajmal|amber|woody|evening-fragrances|unisex|best-sellers',
  '{"top": "White Pepper, Apple, Lavender, Cardamom", "middle": "Orris, Cedarwood", "base": "Amber, Patchouli, Woody Notes"}'::jsonb,
  1
),
(
  'rasasi-hawas-for-him',
  'Rasasi Hawas For Him',
  'Rasasi',
  48.00, 58.00,
  'https://images.unsplash.com/photo-1616949755610-8c9bbc08f138?auto=format&fit=crop&w=800&q=80',
  'https://images.unsplash.com/photo-1595425970377-c9703cf48b6d?auto=format&fit=crop&w=800&q=80',
  'The celebrated aquatic powerhouse. Fresh apple, cinnamon, citrus bergamot with aquatic marine accords and seductive ambergris.',
  '100ml Eau De Parfum',
  'best-sellers|rasasi|mens|summer-fragrances|everyday-fragrances|fruity-1',
  '{"top": "Apple, Bergamot, Lemon, Cinnamon", "middle": "Watery Notes, Plum, Orange Blossom, Cardamom", "base": "Ambergris, Musk, Patchouli, Driftwood"}'::jsonb,
  1
),
(
  'blends-of-dubai-royal-bakhoor',
  'Blends of Dubai Royal Bakhoor Extrait',
  'Blends of Dubai',
  72.00, 90.00,
  'https://images.unsplash.com/photo-1541643600914-78b084683601?auto=format&fit=crop&w=800&q=80',
  'https://images.unsplash.com/photo-1594035910387-fea47794261f?auto=format&fit=crop&w=800&q=80',
  'An authentic homage to traditional Arabian majlis bakhoor. Frankincense, myrrh, smoky woods, and sensual white amber that lingers gracefully.',
  '100ml Extrait De Parfum',
  'blends-of-dubai|extrait-de-parfum|oud-1|woody|evening-fragrances|unisex',
  '{"top": "Frankincense, Aldehydes, Saffron", "middle": "Smoky Woods, Cashmere, Rose", "base": "Oud, White Amber, Musk"}'::jsonb,
  1
),
(
  'viali-velvet-musk',
  'Viali Velvet Musk Oil',
  'Viali',
  28.00, 35.00,
  'https://images.unsplash.com/photo-1594035910387-fea47794261f?auto=format&fit=crop&w=800&q=80',
  'https://images.unsplash.com/photo-1563178406-4cdc2923acbc?auto=format&fit=crop&w=800&q=80',
  'Pure concentrated perfume oil (Attar). Alcohol-free and intensely skin-loving with velvety white musk, powdery iris, and fresh lily of the valley.',
  '12ml Concentrated Perfume Oil',
  'viali|perfume-oils|womens|unisex|spring-collection',
  '{"top": "Lily of the Valley, Lotus Flower", "middle": "Powdery Notes, White Iris", "base": "Velvet White Musk, Clean Cedar"}'::jsonb,
  1
),
(
  'gulf-orchid-rose-vanilla',
  'Gulf Orchid Rose Vanilla',
  'Gulf Orchid',
  34.00, 42.00,
  'https://images.unsplash.com/photo-1588405748880-12d1d2a59f75?auto=format&fit=crop&w=800&q=80',
  'https://images.unsplash.com/photo-1523293182086-7651a899d37f?auto=format&fit=crop&w=800&q=80',
  'A delectable marriage of crystalline sugar roses and rich Madagascan vanilla bean with cedarwood undertones.',
  '100ml Eau De Parfum',
  'gulf-orchid|womens|floral|gourmand|everyday-fragrances',
  '{"top": "Calabrian Lemon, Dew Drops", "middle": "Turkish Rose, Sugared Petals", "base": "Vanilla, White Musk, Cedar"}'::jsonb,
  1
),
(
  'essential-perfume-oud-rose',
  'Essential Perfume Oud & Damask Rose',
  'Essential Perfume',
  52.00, 65.00,
  'https://images.unsplash.com/photo-1592945403244-b3fbafd7f539?auto=format&fit=crop&w=800&q=80',
  'https://images.unsplash.com/photo-1595425970377-c9703cf48b6d?auto=format&fit=crop&w=800&q=80',
  'Timeless luxury captured in a flacon. Damascus rose petals infused with rich agarwood oil and warm amber.',
  '100ml Eau De Parfum',
  'essential-perfume|floral|oud-1|womens|evening-fragrances',
  '{"top": "Taif Rose, Pink Pepper", "middle": "Damask Rose, Clove, Agarwood", "base": "Amber, Praline, Agarwood"}'::jsonb,
  1
),
(
  'oud-elixir-discovery-set',
  'Oud Elixir Royal Discovery Collection (5 x 10ml Extrait)',
  'Oud Elixir',
  55.00, 75.00,
  'https://images.unsplash.com/photo-1547887537-6158d64c35b3?auto=format&fit=crop&w=800&q=80',
  'https://images.unsplash.com/photo-1594035910387-fea47794261f?auto=format&fit=crop&w=800&q=80',
  'A lavish presentation box containing five 10ml travel flacons of Oud Elixir''s most prestigious extraits: Dubai Oud Intense, Amber Mirage, Royal Musk, Smoked Leather, and Taif Rose.',
  '5 x 10ml Luxury Discovery Set',
  'fragrance-sets|oud-elixir|new-in|best-sellers|unisex|oud-1|extrait-de-parfum',
  '{"top": "Assorted Royal Accords", "middle": "Cambodian Oud, Taif Rose, Saffron", "base": "Ambergris, Musk, Cedarwood"}'::jsonb,
  1
),
(
  'afnan-supremacy-gift-set',
  'Afnan Supremacy Silver Luxury Gift Set',
  'Afnan',
  58.00, 72.00,
  'https://images.unsplash.com/photo-1523293182086-7651a899d37f?auto=format&fit=crop&w=800&q=80',
  'https://images.unsplash.com/photo-1563178406-4cdc2923acbc?auto=format&fit=crop&w=800&q=80',
  'The ultimate masculine gift presentation. Includes a full-size 100ml Eau De Parfum and matching 150ml perfumed deodorant spray in an embossed collector box.',
  '100ml EDP + 150ml Deodorant Set',
  'fragrance-sets|afnan|mens|best-sellers|fruity-1|woody',
  '{"top": "Apple, Bergamot, Blackcurrant, Pineapple", "middle": "Rose, Birch, Moroccan Jasmine, Patchouli", "base": "Oakmoss, Musk, Ambergris, Vanilla"}'::jsonb,
  1
),
(
  'lattafa-khamrah-deodorant',
  'Lattafa Khamrah Perfumed Deodorant Spray',
  'Lattafa',
  14.00, 18.00,
  'https://images.unsplash.com/photo-1595425970377-c9703cf48b6d?auto=format&fit=crop&w=800&q=80',
  'https://images.unsplash.com/photo-1541643600914-78b084683601?auto=format&fit=crop&w=800&q=80',
  'Rich, warming perfumed all-over deodorant spray echoing the sweet dates, cinnamon, and vanilla notes of Khamrah.',
  '200ml Luxury Deodorant Body Spray',
  'deodorants|lattafa|gourmand|unisex|new-in',
  '{"top": "Cinnamon, Nutmeg", "middle": "Dates, Praline", "base": "Vanilla, Tonka Bean"}'::jsonb,
  1
),
(
  'afnan-supremacy-deodorant',
  'Afnan Supremacy Silver Perfumed Deodorant Spray',
  'Afnan',
  14.00, 18.00,
  'https://images.unsplash.com/photo-1563178406-4cdc2923acbc?auto=format&fit=crop&w=800&q=80',
  'https://images.unsplash.com/photo-1523293182086-7651a899d37f?auto=format&fit=crop&w=800&q=80',
  'Invigorating all-day perfumed body spray featuring crisp birch, pineapple, and smoky woods for lasting freshness.',
  '200ml Luxury Deodorant Body Spray',
  'deodorants|afnan|mens|summer-fragrances|fruity-1',
  '{"top": "Pineapple, Bergamot", "middle": "Birch, Jasmine", "base": "Musk, Ambergris"}'::jsonb,
  1
),
(
  'blends-of-dubai-majlis-air-freshener',
  'Blends of Dubai Royal Majlis Air Freshener',
  'Blends of Dubai',
  16.00, 22.00,
  'https://images.unsplash.com/photo-1541643600914-78b084683601?auto=format&fit=crop&w=800&q=80',
  'https://images.unsplash.com/photo-1594035910387-fea47794261f?auto=format&fit=crop&w=800&q=80',
  'Transform your living space with the rich aromas of traditional Arabian bakhoor, frankincense, amber, and aged cedarwood.',
  '300ml Luxury Room & Linen Spray',
  'air-freshners|blends-of-dubai|oud-1|unisex',
  '{"top": "Frankincense, Saffron", "middle": "Smoky Woods, Cashmere", "base": "Agarwood, Amber"}'::jsonb,
  1
),
(
  'lattafa-raghba-air-freshener',
  'Lattafa Raghba Home & Linen Fragrance Mist',
  'Lattafa',
  15.00, 20.00,
  'https://images.unsplash.com/photo-1588405748880-12d1d2a59f75?auto=format&fit=crop&w=800&q=80',
  'https://images.unsplash.com/photo-1595425970377-c9703cf48b6d?auto=format&fit=crop&w=800&q=80',
  'Enchanting room mist infused with sweet vanilla, caramel, sandalwood, and soft incense.',
  '300ml Atmospheric Fragrance Mist',
  'air-freshners|lattafa|gourmand|unisex',
  '{"top": "Vanilla, Sugar", "middle": "Oud, Sandalwood", "base": "Incense, Amber"}'::jsonb,
  1
),
(
  'rue-broca-theoreme-pour-homme',
  'Rue Broca Théorème Pour Homme',
  'Rue Broca',
  35.00, 45.00,
  'https://images.unsplash.com/photo-1523293182086-7651a899d37f?auto=format&fit=crop&w=800&q=80',
  'https://images.unsplash.com/photo-1563178406-4cdc2923acbc?auto=format&fit=crop&w=800&q=80',
  'A sophisticated citrus-woody fragrance featuring sparkling grapefruit, spicy pink pepper, and rich ambroxan on a cedar base.',
  '90ml Eau De Parfum',
  'rue-broca|mens|everyday-fragrances|woody|summer-fragrances|fruity-1',
  '{"top": "Grapefruit, Bergamot", "middle": "Pink Pepper, Ginger", "base": "Ambroxan, Cedarwood, Vetiver"}'::jsonb,
  1
),
(
  'ard-al-zaafaran-shams-al-emarat',
  'Ard Al Zaafaran Shams Al Emarat Khususi',
  'Ard Al Zaafaran',
  32.00, 42.00,
  'https://images.unsplash.com/photo-1594035910387-fea47794261f?auto=format&fit=crop&w=800&q=80',
  'https://images.unsplash.com/photo-1547887537-6158d64c35b3?auto=format&fit=crop&w=800&q=80',
  'An alluring oriental gourmand accord opening with crisp apple and mandarin, leading to warm vanilla, rose, and ambergris.',
  '100ml Eau De Parfum',
  'ard-al-zaafaran|fruity-1|amber|unisex|best-sellers|gourmand',
  '{"top": "Apple, Mandarin Orange, Vanilla", "middle": "Rose, Ylang-Ylang, Spices", "base": "Ambergris, Sandalwood, White Musk"}'::jsonb,
  1
),
(
  'ard-al-zaafaran-dirham-gold',
  'Ard Al Zaafaran Dirham Gold',
  'Ard Al Zaafaran',
  29.00, 38.00,
  'https://images.unsplash.com/photo-1588405748880-12d1d2a59f75?auto=format&fit=crop&w=800&q=80',
  'https://images.unsplash.com/photo-1592945403244-b3fbafd7f539?auto=format&fit=crop&w=800&q=80',
  'Bright and opulent golden fragrance blending pineapple, bergamot, jasmine, and warm vanilla with sandalwood.',
  '100ml Eau De Parfum',
  'ard-al-zaafaran|fruity-1|floral|womens|everyday-fragrances|spring-collection',
  '{"top": "Pineapple, Bergamot", "middle": "Jasmine, Rose, Carnation", "base": "Vanilla, Sandalwood, Tonka Bean"}'::jsonb,
  1
),
(
  'viali-santal-blanc-last-chance',
  'Viali Santal Blanc Rare Edition Flacon',
  'Viali',
  39.00, 65.00,
  'https://images.unsplash.com/photo-1592945403244-b3fbafd7f539?auto=format&fit=crop&w=800&q=80',
  'https://images.unsplash.com/photo-1594035910387-fea47794261f?auto=format&fit=crop&w=800&q=80',
  'Final quantities of Viali''s coveted Santal Blanc. Creamy Australian sandalwood, white cardamom, and velvety iris.',
  '100ml Eau De Parfum',
  'last-chance|viali|woody|unisex|winter|autumn',
  '{"top": "White Cardamom, Fig Nectar", "middle": "Iris, Violet Blossom", "base": "Sandalwood, Tonka, Amber"}'::jsonb,
  1
),
(
  'essential-perfume-rose-oud-travel',
  'Essential Perfume Rose & Oud Travel Atomiser Set',
  'Essential Perfume',
  44.00, 58.00,
  'https://images.unsplash.com/photo-1547887537-6158d64c35b3?auto=format&fit=crop&w=800&q=80',
  'https://images.unsplash.com/photo-1592945403244-b3fbafd7f539?auto=format&fit=crop&w=800&q=80',
  'Three 15ml refillable travel atomisers housed in a leatherette pouch. High Extrait concentration of Damascus Rose & Oud.',
  '3 x 15ml Extrait De Parfum Set',
  'fragrance-sets|essential-perfume|last-chance|floral|womens|oud-1',
  '{"top": "Taif Rose, Saffron", "middle": "Damask Rose, Clove", "base": "Agarwood, Amber"}'::jsonb,
  1
),
(
  'swiss-arabian-casablanca',
  'Swiss Arabian Casablanca',
  'Swiss Arabian',
  46.00, 58.00,
  'https://images.unsplash.com/photo-1616949755610-8c9bbc08f138?auto=format&fit=crop&w=800&q=80',
  'https://images.unsplash.com/photo-1588405748880-12d1d2a59f75?auto=format&fit=crop&w=800&q=80',
  'A breathtaking unisex gourmand with juicy ripe grapes, crisp apple, caramel, patchouli, and sensual white amber.',
  '100ml Eau De Parfum',
  'swiss-arabian|fruity-1|gourmand|unisex|autumn|best-sellers',
  '{"top": "Apple, Grapes", "middle": "Patchouli, Orris", "base": "Amber, Balsam, Caramel, Musk, Suede"}'::jsonb,
  1
)
ON CONFLICT (handle) DO UPDATE SET
  title = EXCLUDED.title,
  brand = EXCLUDED.brand,
  price = EXCLUDED.price,
  compare_at_price = EXCLUDED.compare_at_price,
  image_url = EXCLUDED.image_url,
  image_url_2 = EXCLUDED.image_url_2,
  description = EXCLUDED.description,
  size = EXCLUDED.size,
  collections = EXCLUDED.collections,
  notes = EXCLUDED.notes,
  in_stock = EXCLUDED.in_stock;

-- -----------------------------------------------------------------------------
-- 3. Populate Product <-> Collection Mappings
-- -----------------------------------------------------------------------------
-- Ensure any dynamic collection tags present on products exist in collections
INSERT INTO collections (handle, title)
SELECT DISTINCT TRIM(tag) AS handle, INITCAP(REPLACE(TRIM(tag), '-', ' ')) AS title
FROM products,
     LATERAL unnest(string_to_array(COALESCE(collections, ''), '|')) AS tag
WHERE TRIM(tag) <> ''
ON CONFLICT (handle) DO NOTHING;

-- Link every product to its collections in the pivot table
INSERT INTO product_collections (product_id, collection_id)
SELECT p.id, c.id
FROM products p
CROSS JOIN LATERAL unnest(string_to_array(COALESCE(p.collections, ''), '|')) AS tag
JOIN collections c ON c.handle = LOWER(TRIM(tag))
WHERE TRIM(tag) <> ''
ON CONFLICT DO NOTHING;

-- -----------------------------------------------------------------------------
-- 4. Seed Initial Sample Subscriber, User & Demo Order
-- -----------------------------------------------------------------------------
INSERT INTO subscribers (email, source, status) VALUES
  ('concierge@perfumezone.uk', 'footer', 'subscribed'),
  ('vip@perfumezone.uk', 'checkout', 'subscribed')
ON CONFLICT (email) DO NOTHING;

INSERT INTO users (email, name, phone, address, apartment, city, postcode, country) VALUES
  ('demo@perfumezone.uk', 'Eleanor Vance', '+44 20 7946 0991', '48 Mayfair Luxury Lane', 'Suite 2', 'London', 'W1K 2PB', 'United Kingdom')
ON CONFLICT (email) DO NOTHING;

INSERT INTO orders (
  id, user_id, email, customer_name, phone, address, apartment,
  city, postcode, country, subtotal, shipping_cost, discount,
  coupon_code, total, shipping_method, payment_method, status, items
)
SELECT
  'PZ-100001',
  u.id,
  u.email,
  u.name,
  u.phone,
  u.address,
  u.apartment,
  u.city,
  u.postcode,
  u.country,
  107.00,
  0.00,
  10.70,
  'PERFUME10',
  96.30,
  'free',
  'card',
  'Confirmed',
  '[
    {
      "id": 1,
      "handle": "oud-elixir-dubai-oud-intense",
      "title": "Oud Elixir Dubai Oud Intense",
      "brand": "Oud Elixir",
      "size": "100ml Extrait De Parfum",
      "price": 65.00,
      "qty": 1,
      "image": "https://images.unsplash.com/photo-1594035910387-fea47794261f?auto=format&fit=crop&w=800&q=80"
    },
    {
      "id": 4,
      "handle": "lattafa-khamrah",
      "title": "Lattafa Khamrah Luxury Edition",
      "brand": "Lattafa",
      "size": "100ml Eau De Parfum",
      "price": 42.00,
      "qty": 1,
      "image": "https://images.unsplash.com/photo-1595425970377-c9703cf48b6d?auto=format&fit=crop&w=800&q=80"
    }
  ]'::jsonb
FROM users u
WHERE u.email = 'demo@perfumezone.uk'
ON CONFLICT (id) DO NOTHING;

INSERT INTO order_items (
  order_id, product_id, product_handle, title, brand, size, unit_price, quantity, line_total, image_url
)
SELECT
  'PZ-100001',
  p.id,
  p.handle,
  p.title,
  p.brand,
  p.size,
  p.price,
  1,
  p.price,
  p.image_url
FROM products p
WHERE p.handle IN ('oud-elixir-dubai-oud-intense', 'lattafa-khamrah')
  AND NOT EXISTS (SELECT 1 FROM order_items oi WHERE oi.order_id = 'PZ-100001' AND oi.product_handle = p.handle);
