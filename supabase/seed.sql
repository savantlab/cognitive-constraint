-- Seed data for Cognitive Constraint Journal

-- Authors
INSERT INTO authors (id, email, name, orcid, bio) VALUES
  ('a1000001-0000-0000-0000-000000000001', 'marcus.aurelius@example.com', 'Marcus Aurelius', '0000-0001-2345-6789', 'Philosophus et imperator Romanus. Specialitas in meditationes et cognitione.'),
  ('a1000002-0000-0000-0000-000000000002', 'cicero@example.com', 'Marcus Tullius Cicero', '0000-0002-3456-7890', 'Orator et philosophus. Expertus in rhetorica et re publica.'),
  ('a1000003-0000-0000-0000-000000000003', 'seneca@example.com', 'Lucius Annaeus Seneca', '0000-0003-4567-8901', 'Stoicus philosophus et dramaturgus. Focus in ethica et tranquillitate animi.');

-- Papers
INSERT INTO papers (id, title, slug, abstract, content, author_id, status, validation_score, doi, published_at) VALUES
  (
    '11000001-0000-0000-0000-000000000001',
    'De Finibus Bonorum et Malorum: Limites Cognitionis Humanae',
    'de-finibus-bonorum-et-malorum',
    'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.',
    E'# Introductio\n\nLorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.\n\n## Methodus\n\nDuis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.\n\n### Participantes\n\nSed ut perspiciatis unde omnis iste natus error sit voluptatem accusantium doloremque laudantium, totam rem aperiam, eaque ipsa quae ab illo inventore veritatis et quasi architecto beatae vitae dicta sunt explicabo.\n\n## Resultata\n\nNemo enim ipsam voluptatem quia voluptas sit aspernatur aut odit aut fugit, sed quia consequuntur magni dolores eos qui ratione voluptatem sequi nesciunt.\n\n```python\ndef calculate_cognitive_load(stimuli, constraints):\n    return sum(s.complexity * c.weight for s, c in zip(stimuli, constraints))\n```\n\n## Discussio\n\nNeque porro quisquam est, qui dolorem ipsum quia dolor sit amet, consectetur, adipisci velit, sed quia non numquam eius modi tempora incidunt ut labore et dolore magnam aliquam quaerat voluptatem.\n\n## Conclusio\n\nUt enim ad minima veniam, quis nostrum exercitationem ullam corporis suscipit laboriosam, nisi ut aliquid ex ea commodi consequatur.',
    'a1000002-0000-0000-0000-000000000002',
    'PUBLISHED',
    3,
    NULL,
    '2026-01-15 10:00:00+00'
  ),
  (
    '11000002-0000-0000-0000-000000000002',
    'Meditationes de Prima Philosophia Computatrali',
    'meditationes-de-prima-philosophia',
    'Quis autem vel eum iure reprehenderit qui in ea voluptate velit esse quam nihil molestiae consequatur, vel illum qui dolorem eum fugiat quo voluptas nulla pariatur.',
    E'# Meditatio Prima\n\nQuis autem vel eum iure reprehenderit qui in ea voluptate velit esse quam nihil molestiae consequatur, vel illum qui dolorem eum fugiat quo voluptas nulla pariatur.\n\n## De Dubio Methodico\n\nAt vero eos et accusamus et iusto odio dignissimos ducimus qui blanditiis praesentium voluptatum deleniti atque corrupti quos dolores et quas molestias excepturi sint occaecati cupiditate non provident.\n\n## Experimenta\n\nSimilique sunt in culpa qui officia deserunt mollitia animi, id est laborum et dolorum fuga. Et harum quidem rerum facilis est et expedita distinctio.\n\n### Figura 1: Distributio Responsorum\n\n| Condicio | N | Media | SD |\n|----------|---|-------|----|\n| A        | 50| 4.2   | 1.1|\n| B        | 50| 3.8   | 0.9|\n\n## Conclusiones\n\nNam libero tempore, cum soluta nobis est eligendi optio cumque nihil impedit quo minus id quod maxime placeat facere possimus.',
    'a1000001-0000-0000-0000-000000000001',
    'PUBLISHED',
    5,
    NULL,
    '2026-01-20 14:30:00+00'
  ),
  (
    '11000003-0000-0000-0000-000000000003',
    'Epistulae Morales ad Algorithmos',
    'epistulae-morales-ad-algorithmos',
    'Temporibus autem quibusdam et aut officiis debitis aut rerum necessitatibus saepe eveniet ut et voluptates repudiandae sint et molestiae non recusandae.',
    E'# Epistula I: De Brevitate Computationis\n\nTemporibus autem quibusdam et aut officiis debitis aut rerum necessitatibus saepe eveniet ut et voluptates repudiandae sint et molestiae non recusandae.\n\n## Argumentum\n\nItaque earum rerum hic tenetur a sapiente delectus, ut aut reiciendis voluptatibus maiores alias consequatur aut perferendis doloribus asperiores repellat.\n\n## Propositio\n\nOmnis voluptas assumenda est, omnis dolor repellendus. Temporibus autem quibusdam et aut officiis debitis aut rerum necessitatibus saepe eveniet.',
    'a1000003-0000-0000-0000-000000000003',
    'UNDER_REVIEW',
    0,
    NULL,
    NULL
  ),
  (
    '11000004-0000-0000-0000-000000000004',
    'De Natura Rerum Digitalium',
    'de-natura-rerum-digitalium',
    'Draft paper exploring digital ontology.',
    E'# Work in Progress\n\nThis is a draft exploring the nature of digital objects.',
    'a1000001-0000-0000-0000-000000000001',
    'DRAFT',
    0,
    NULL,
    NULL
  );

-- Validations
INSERT INTO validations (id, paper_id, validator_id, type, result, notes) VALUES
  ('c1000001-0000-0000-0000-000000000001', '11000001-0000-0000-0000-000000000001', 'a1000001-0000-0000-0000-000000000001', 'EXPERT_REVIEW', 'CONFIRMED', 'Opus excellens. Methodus clara et resultata valida.'),
  ('c1000002-0000-0000-0000-000000000002', '11000001-0000-0000-0000-000000000001', 'a1000003-0000-0000-0000-000000000003', 'COMPUTATIONAL_REPLICATION', 'CONFIRMED', 'Codex replicatus est. Resultata congruunt.'),
  ('c1000003-0000-0000-0000-000000000003', '11000001-0000-0000-0000-000000000001', 'a1000003-0000-0000-0000-000000000003', 'MATHEMATICAL_PROOF', 'CONFIRMED', 'Demonstratio mathematica verificata.'),
  ('c1000004-0000-0000-0000-000000000004', '11000002-0000-0000-0000-000000000002', 'a1000002-0000-0000-0000-000000000002', 'EXPERT_REVIEW', 'CONFIRMED', 'Philosophia profunda et bene argumentata.'),
  ('c1000005-0000-0000-0000-000000000005', '11000002-0000-0000-0000-000000000002', 'a1000003-0000-0000-0000-000000000003', 'EXPERT_REVIEW', 'CONFIRMED', 'Concordo cum methodo et conclusionibus.'),
  ('c1000006-0000-0000-0000-000000000006', '11000002-0000-0000-0000-000000000002', 'a1000002-0000-0000-0000-000000000002', 'COMPUTATIONAL_REPLICATION', 'CONFIRMED', 'Experimenta computatralia replicata.'),
  ('c1000007-0000-0000-0000-000000000007', '11000002-0000-0000-0000-000000000002', 'a1000001-0000-0000-0000-000000000001', 'MATHEMATICAL_PROOF', 'CONFIRMED', 'Probatio completa.'),
  ('c1000008-0000-0000-0000-000000000008', '11000002-0000-0000-0000-000000000002', 'a1000003-0000-0000-0000-000000000003', 'REFUTATION_ATTEMPT', 'FAILED', 'Tentavi refutare sed argumenta firma sunt.');

-- Replications
INSERT INTO replications (id, paper_id, replicator_id, success, code_url, notes) VALUES
  ('d1000001-0000-0000-0000-000000000001', '11000001-0000-0000-0000-000000000001', 'a1000003-0000-0000-0000-000000000003', true, 'https://github.com/seneca/de-finibus-replication', 'Replicatio plena. Omnia resultata congruunt cum originali.'),
  ('d1000002-0000-0000-0000-000000000002', '11000002-0000-0000-0000-000000000002', 'a1000002-0000-0000-0000-000000000002', true, 'https://github.com/cicero/meditationes-replication', 'Codex bene documentatus. Resultata confirmata.'),
  ('d1000003-0000-0000-0000-000000000003', '11000002-0000-0000-0000-000000000002', 'a1000003-0000-0000-0000-000000000003', true, NULL, 'Replicatio manualis sine codice publico.');
