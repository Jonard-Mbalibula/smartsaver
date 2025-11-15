import { neon } from '@neondatabase/serverless'; 
// NOTE: Make sure to import this if you're using Neon

export default function Dashboard() {
  
  // The database interaction function (Server Action)
  async function create(formData /*: FormData */) { 
    'use server'; // This directive is crucial for Next.js/Server Actions
    
    // IMPORTANT: Verify that 'DATABASE_URL' is the correct environment variable name 
    // based on your Vercel/Neon configuration.
    const sql = neon(`${process.env.DATABASE_URL}`); 
    const comment = formData.get('comment');
    
    await sql('INSERT INTO comments (comment) VALUES ($1)', [comment]);
  }

  return (
    <div className="dashboard-content">
      <h1>Dashboard Overview</h1>
      
      {/* The form that calls the 'create' Server Action */}
      <form action={create}>
        <input name="comment" type="text" placeholder="write a comment" />
        <button type="submit">Submit</button>
      </form>
      
      {/* ... other dashboard elements ... */}
    </div>
  );
}