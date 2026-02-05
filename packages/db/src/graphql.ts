const GRAPHQL_URL = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/graphql/v1`;

export type GraphQLResponse<T> = {
  data: T;
  errors?: Array<{ message: string }>;
};

export async function gql<T>(
  query: string,
  variables?: Record<string, unknown>,
  authToken?: string
): Promise<T> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    'apikey': process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  };

  // Add auth header if user is authenticated
  if (authToken) {
    headers['Authorization'] = `Bearer ${authToken}`;
  }

  const res = await fetch(GRAPHQL_URL, {
    method: 'POST',
    headers,
    body: JSON.stringify({ query, variables }),
  });

  const json: GraphQLResponse<T> = await res.json();

  if (json.errors?.length) {
    const errorMessage = json.errors[0]?.message ?? 'Unknown GraphQL error';
    throw new Error(errorMessage);
  }

  return json.data;
}

// Example queries for your schema:
// 
// List papers:
// const { papersCollection } = await gql<{ papersCollection: { edges: Array<{ node: Paper }> } }>(`
//   query {
//     papersCollection(filter: { status: { eq: "PUBLISHED" } }, first: 20) {
//       edges {
//         node {
//           id
//           title
//           slug
//           abstract
//           status
//           doi
//           publishedAt
//           authors {
//             id
//             name
//             orcid
//           }
//         }
//       }
//     }
//   }
// `);
//
// Get single paper with validations:
// const { papersCollection } = await gql<...>(`
//   query GetPaper($slug: String!) {
//     papersCollection(filter: { slug: { eq: $slug } }, first: 1) {
//       edges {
//         node {
//           id
//           title
//           content
//           validationsCollection {
//             edges {
//               node {
//                 type
//                 result
//                 notes
//               }
//             }
//           }
//         }
//       }
//     }
//   }
// `, { slug: "my-paper" });
