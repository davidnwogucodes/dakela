-- ==========================================================================
-- Dakela Exports — initial content
--
-- Run ONCE, after schema.sql. Moves the six product groups that were hardcoded
-- in src/data/products.ts into the database, and installs the default enquiry
-- form. Re-running is harmless (every insert is guarded) but it will NOT undo
-- the owner's later edits.
--
-- Image note: `image_path` holds either a path starting with "/" (a file
-- already in public/assets, as seeded here) or a Storage object path (what the
-- dashboard writes when the owner uploads). The renderer distinguishes the two
-- by the leading slash, so the existing photography keeps working untouched.
-- ==========================================================================

insert into public.products
  (slug, title, description, commodities, image_path, image_position, alt, origin, uses, nutrition, seasonality, sort_order)
values
  (
    'spices-and-herbs',
    'Spices & Herbs',
    'Sun-dried and cleaned aromatics from northern Nigeria, sorted for colour, aroma and low foreign matter.',
    array['Hibiscus Flowers', 'Ginger', 'Turmeric', 'Garlic', 'Chili Pepper'],
    '/assets/prod-spices.webp',
    'center',
    'Dried hibiscus flowers and spices sorted for export from northern Nigeria',
    'Kano, Katsina and Jigawa states',
    'Beverage infusions, natural colouring, seasoning blends and pharmaceutical extracts.',
    'Hibiscus is high in vitamin C and anthocyanins; ginger and turmeric carry gingerol and curcumin respectively.',
    'Harvest November to March, with steady supply through to June.',
    1
  ),
  (
    'oilseeds-and-grains',
    'Oilseeds & Grains',
    'Bulk staples for crushing and milling, cleaned to agreed purity and moisture before bagging.',
    array['Sesame Seeds', 'Soybeans', 'Sorghum', 'Millet', 'Maize'],
    '/assets/prod-oilseeds.webp',
    'center',
    'Cleaned sesame seeds and bulk grains prepared for bagging',
    'Benue, Nasarawa, Jigawa and the middle belt',
    'Oil crushing, tahini and confectionery, animal feed, milling and brewing.',
    'Sesame runs roughly 50% oil and 20% protein; soybeans about 36% protein.',
    'Sesame harvests October to December; grains run year-round from store.',
    2
  ),
  (
    'nuts-and-oil-crops',
    'Nuts & Oil Crops',
    'Raw cashew, shea and groundnut lots sized and graded for processors and kernel buyers.',
    array['Cashew Nuts', 'Shea Nuts', 'Groundnuts'],
    '/assets/prod-nuts.webp',
    'center',
    'Raw cashew nuts graded and sized for kernel processors',
    'Kogi, Kwara, Oyo and Niger states',
    'Kernel processing, confectionery, cosmetics and shea butter production.',
    'Cashew kernels are rich in unsaturated fats, magnesium and copper; groundnuts carry about 25% protein.',
    'Cashew February to May; shea June to September.',
    3
  ),
  (
    'cocoa-products',
    'Cocoa Products',
    'Fermented beans and processed derivatives from the south-west belt, for confectionery and beverage manufacturers.',
    array['Cocoa Beans', 'Cocoa Powder', 'Cocoa Butter', 'Cocoa Cake'],
    '/assets/prod-cocoa.webp',
    'center',
    'Fermented cocoa beans from south-west Nigeria',
    'Ondo, Osun, Ogun and Cross River states',
    'Chocolate and confectionery, beverages, cosmetics and pharmaceutical bases.',
    'Cocoa is a notable source of flavanols, magnesium and iron.',
    'Main crop October to February; light crop May to August.',
    4
  ),
  (
    'palm-products',
    'Palm Products',
    'Crude and kernel oils in drums or flexitanks, with free fatty acid levels confirmed before loading.',
    array['Crude Palm Oil', 'Palm Kernel Oil', 'Palm Kernel'],
    '/assets/prod-palm.webp',
    'center',
    'Crude palm oil in drums ready for loading',
    'Edo, Delta, Akwa Ibom and Cross River states',
    'Food manufacturing, frying fats, soap and oleochemicals.',
    'Crude palm oil is high in vitamin E tocotrienols and provitamin A carotenoids.',
    'Peak production March to July, available year-round.',
    5
  ),
  (
    'cassava-products',
    'Cassava Products',
    'Flour, starch, garri and high-quality cassava flour milled for food and industrial use.',
    array['Cassava Flour', 'Garri', 'Cassava Starch', 'HQCF'],
    '/assets/prod-cassava.webp',
    'center',
    'Milled cassava flour and starch for food and industrial use',
    'Benue, Kogi, Oyo and the south-east',
    'Composite flour blends, food thickening, adhesives, textiles and ethanol.',
    'Predominantly carbohydrate; a staple energy source, naturally gluten free.',
    'Harvested year-round on a rolling planting cycle.',
    6
  )
on conflict (slug) do nothing;

-- --------------------------------------------------------------------------
-- Default enquiry form. `system` fields cannot be deleted in the dashboard.
-- --------------------------------------------------------------------------
insert into public.form_fields
  (form, key, label, hint, placeholder, type, options, required, system, sort_order)
values
  -- Shared — asked on both sides of the branch
  ('shared', 'fullName', 'Full name',        null, null, 'text',     '{}', true,  true,  1),
  ('shared', 'company',  'Company',          null, null, 'text',     '{}', true,  true,  2),
  ('shared', 'email',    'Email',            null, null, 'email',    '{}', true,  true,  3),
  ('shared', 'phone',    'Phone',            null, '+234…', 'tel',   '{}', false, false, 4),

  -- Buyer
  ('buyer', 'country',         'Destination country', null, null, 'text', '{}', true,  false, 1),
  ('buyer', 'destinationPort', 'Destination port',    null, 'e.g. Rotterdam, Nhava Sheva', 'text', '{}', false, false, 2),
  ('buyer', 'incoterm',        'Incoterm',
     'Leave blank if you would like us to advise.', null, 'select',
     array['EXW', 'FCA', 'FOB', 'CFR', 'CIF'], false, false, 3),
  ('buyer', 'targetMonth',     'Target first shipment', null, null, 'month', '{}', false, false, 4),

  -- Supplier
  ('supplier', 'state', 'State', null, null, 'select',
     array['Abia','Adamawa','Akwa Ibom','Anambra','Bauchi','Bayelsa','Benue','Borno',
           'Cross River','Delta','Ebonyi','Edo','Ekiti','Enugu','FCT — Abuja','Gombe',
           'Imo','Jigawa','Kaduna','Kano','Katsina','Kebbi','Kogi','Kwara','Lagos',
           'Nasarawa','Niger','Ogun','Ondo','Osun','Oyo','Plateau','Rivers','Sokoto',
           'Taraba','Yobe','Zamfara'],
     true, false, 1),
  ('supplier', 'lga', 'LGA / town', null, null, 'text', '{}', false, false, 2),
  ('supplier', 'yearsOperating', 'Years in operation', null, null, 'select',
     array['Less than 1 year','1–3 years','3–5 years','5–10 years','More than 10 years'],
     false, false, 3),
  ('supplier', 'certifications', 'Certifications held',
     'Tick any that apply. Not having them does not disqualify you.', null, 'multiselect',
     array['NEPC registered','NAFDAC','SONCAP','Organic','GlobalGAP','Fairtrade','None yet'],
     false, false, 4),

  -- Shared, last: free-text notes
  ('shared', 'message', 'Notes',
     'Anything that shapes the offer — packaging, inspection, payment terms.',
     null, 'textarea', '{}', false, false, 90)
on conflict (form, key) do nothing;
