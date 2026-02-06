import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const getServiceClient = () => createClient(supabaseUrl, supabaseServiceKey);

interface Paper {
  id: string;
  title: string;
  slug: string;
  abstract: string;
  status: string;
  doi: string | null;
  published_at: string | null;
}

interface Author {
  name: string;
  orcid?: string | null;
}

type RouteParams = { params: Promise<{ id: string }> };

// Configuration for Crossref DOI registration
// These would come from environment variables once you have Crossref membership
const CROSSREF_DOI_PREFIX = process.env.CROSSREF_DOI_PREFIX; // e.g., '10.12345'
const CROSSREF_USERNAME = process.env.CROSSREF_USERNAME;
const CROSSREF_PASSWORD = process.env.CROSSREF_PASSWORD;
const CROSSREF_API_URL = 'https://api.crossref.org/v2/works';

// Generate DOI suffix for a paper
function generateDoiSuffix(paperId: string, publishedAt: string): string {
  const year = new Date(publishedAt).getFullYear();
  // Use first 8 chars of UUID for suffix
  const shortId = paperId.replace(/-/g, '').substring(0, 8);
  return `ccj.${year}.${shortId}`;
}

// POST /api/papers/[id]/doi - Register DOI with Crossref
export async function POST(request: NextRequest, { params }: RouteParams) {
  const { id } = await params;
  
  // Check if Crossref is configured
  if (!CROSSREF_DOI_PREFIX || !CROSSREF_USERNAME || !CROSSREF_PASSWORD) {
    return NextResponse.json(
      { 
        error: 'DOI registration not configured',
        message: 'Crossref credentials not set. Visit https://www.crossref.org/membership/ to become a member.',
        doiPreview: CROSSREF_DOI_PREFIX 
          ? `${CROSSREF_DOI_PREFIX}/ccj.YYYY.XXXXXXXX` 
          : '10.XXXXX/ccj.YYYY.XXXXXXXX'
      },
      { status: 503 }
    );
  }

  const serviceClient = getServiceClient();
  
  // Get the paper
  const { data: paper, error: fetchError } = await serviceClient
    .from('papers')
    .select('*, authors(*)')
    .eq('id', id)
    .single();

  if (fetchError || !paper) {
    return NextResponse.json({ error: 'Paper not found' }, { status: 404 });
  }

  const typedPaper = paper as Paper & { authors: Author | null };

  // Paper must be published to get a DOI
  if (typedPaper.status !== 'PUBLISHED') {
    return NextResponse.json(
      { error: 'Paper must be published before DOI registration' },
      { status: 400 }
    );
  }

  // Check if DOI already exists
  if (typedPaper.doi) {
    return NextResponse.json(
      { error: 'Paper already has a DOI', doi: typedPaper.doi },
      { status: 409 }
    );
  }

  const doiSuffix = generateDoiSuffix(typedPaper.id, typedPaper.published_at!);
  const doi = `${CROSSREF_DOI_PREFIX}/${doiSuffix}`;
  const paperUrl = `${process.env.NEXT_PUBLIC_SITE_URL || 'https://journal.cognitive-constraint.org'}/papers/${typedPaper.slug}`;

  // Build Crossref XML deposit
  // This is a simplified version - full implementation would need complete XML schema
  const crossrefXml = buildCrossrefXml({
    doi,
    url: paperUrl,
    title: typedPaper.title,
    abstract: typedPaper.abstract,
    authors: typedPaper.authors ? [typedPaper.authors] : [],
    publishedAt: typedPaper.published_at!,
  });

  try {
    // Submit to Crossref
    const crossrefResponse = await fetch(CROSSREF_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/vnd.crossref.deposit+xml',
        'Authorization': 'Basic ' + Buffer.from(`${CROSSREF_USERNAME}:${CROSSREF_PASSWORD}`).toString('base64'),
      },
      body: crossrefXml,
    });

    if (!crossrefResponse.ok) {
      const errorText = await crossrefResponse.text();
      console.error('Crossref registration failed:', errorText);
      return NextResponse.json(
        { error: 'DOI registration failed', details: errorText },
        { status: 500 }
      );
    }

    // Update paper with DOI
    const updateData = { doi, updated_at: new Date().toISOString() };
    const { error: updateError } = await serviceClient
      .from('papers')
      .update(updateData)
      .eq('id', id);

    if (updateError) {
      console.error('Failed to update paper with DOI:', updateError);
      return NextResponse.json(
        { error: 'DOI registered but failed to update paper record', doi },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      doi,
      url: `https://doi.org/${doi}`,
    });
  } catch (e) {
    console.error('DOI registration error:', e);
    return NextResponse.json(
      { error: 'DOI registration failed', details: String(e) },
      { status: 500 }
    );
  }
}

// GET /api/papers/[id]/doi - Get DOI info for a paper
export async function GET(request: NextRequest, { params }: RouteParams) {
  const { id } = await params;
  
  const serviceClient = getServiceClient();
  
  const { data: paper, error } = await serviceClient
    .from('papers')
    .select('id, doi, title, slug, status, published_at')
    .eq('id', id)
    .single();

  if (error || !paper) {
    return NextResponse.json({ error: 'Paper not found' }, { status: 404 });
  }

  const typedPaper = paper as Pick<Paper, 'id' | 'doi' | 'title' | 'slug' | 'status' | 'published_at'>;

  if (!typedPaper.doi) {
    // Generate preview of what DOI would be
    const doiSuffix = typedPaper.published_at 
      ? generateDoiSuffix(typedPaper.id, typedPaper.published_at)
      : generateDoiSuffix(typedPaper.id, new Date().toISOString());
    
    return NextResponse.json({
      registered: false,
      doiPreview: CROSSREF_DOI_PREFIX 
        ? `${CROSSREF_DOI_PREFIX}/${doiSuffix}`
        : `10.XXXXX/${doiSuffix}`,
      status: typedPaper.status,
      canRegister: typedPaper.status === 'PUBLISHED' && !!CROSSREF_DOI_PREFIX,
    });
  }

  return NextResponse.json({
    registered: true,
    doi: typedPaper.doi,
    url: `https://doi.org/${typedPaper.doi}`,
    status: typedPaper.status,
  });
}

// Helper to build Crossref deposit XML
interface CrossrefDepositParams {
  doi: string;
  url: string;
  title: string;
  abstract: string;
  authors: Array<{ name: string; orcid?: string | null }>;
  publishedAt: string;
}

function buildCrossrefXml(params: CrossrefDepositParams): string {
  const pubDate = new Date(params.publishedAt);
  const authorXml = params.authors.map(author => {
    const orcidAttr = author.orcid ? ` ORCID="https://orcid.org/${author.orcid}"` : '';
    return `<person_name contributor_role="author" sequence="first"${orcidAttr}>
      <given_name>${author.name.split(' ').slice(0, -1).join(' ')}</given_name>
      <surname>${author.name.split(' ').slice(-1)[0]}</surname>
    </person_name>`;
  }).join('\n');

  return `<?xml version="1.0" encoding="UTF-8"?>
<doi_batch version="5.3.1" xmlns="http://www.crossref.org/schema/5.3.1">
  <head>
    <doi_batch_id>${Date.now()}</doi_batch_id>
    <timestamp>${Date.now()}</timestamp>
    <depositor>
      <depositor_name>Cognitive Constraint Journal</depositor_name>
      <email_address>doi@cognitive-constraint.org</email_address>
    </depositor>
    <registrant>Cognitive Constraint Journal</registrant>
  </head>
  <body>
    <journal>
      <journal_metadata>
        <full_title>Cognitive Constraint Journal</full_title>
        <abbrev_title>CCJ</abbrev_title>
      </journal_metadata>
      <journal_article publication_type="full_text">
        <titles>
          <title>${escapeXml(params.title)}</title>
        </titles>
        <contributors>
          ${authorXml}
        </contributors>
        <publication_date>
          <month>${String(pubDate.getMonth() + 1).padStart(2, '0')}</month>
          <day>${String(pubDate.getDate()).padStart(2, '0')}</day>
          <year>${pubDate.getFullYear()}</year>
        </publication_date>
        <abstract>${escapeXml(params.abstract)}</abstract>
        <doi_data>
          <doi>${params.doi}</doi>
          <resource>${params.url}</resource>
        </doi_data>
      </journal_article>
    </journal>
  </body>
</doi_batch>`;
}

function escapeXml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}
