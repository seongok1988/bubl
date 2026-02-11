(async () => {
  const { createClient } = await import('@supabase/supabase-js')
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  const service = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!url || !anon) {
    console.error('Missing NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY in env')
    process.exit(1)
  }
  const supabase = createClient(url, anon)
  const supabaseAdmin = service ? createClient(url, service) : null

  function rand(s) { return `${s}-${Date.now()}-${Math.floor(Math.random()*10000)}` }

  async function signupAndLogin(prefix) {
    const email = `${prefix}-${Date.now()}@example.invalid`
    const password = 'Password123!'
    console.log('Signing up', email)
    const supa = supabase
    // try sign up
    try {
      await supa.auth.signUp({ email, password })
    } catch (e) {
      // ignore signUp errors
    }

    // signIn to get session
    let { data: signInData, error: signinErr } = await supa.auth.signInWithPassword({ email, password })

    // If sign in failed due to email confirmation or other, try creating user via admin (service role) and then sign in
    if (signinErr) {
      console.warn('Initial sign-in failed, attempting admin user creation (may bypass email confirm).', signinErr?.message || signinErr)
      if (!supabaseAdmin) {
        console.error('No SUPABASE_SERVICE_ROLE_KEY available to create admin user.');
        throw signinErr;
      }
      try {
        // supabaseAdmin.auth.admin.createUser is the admin API
        // create with email_confirm true so we can immediately sign in
        const { data: adminCreate, error: adminErr } = await supabaseAdmin.auth.admin.createUser({ email, password, email_confirm: true })
        if (adminErr) {
          console.error('Admin createUser failed', adminErr)
          throw adminErr
        }
        // try sign in again
        const resp = await supa.auth.signInWithPassword({ email, password })
        signInData = resp.data
        signinErr = resp.error
      } catch (e) {
        console.error('Admin user creation failed', e)
        throw e
      }
    }

    if (signinErr) {
      console.error('Signin failed', signinErr)
      throw signinErr
    }

    const user = signInData.user
    const token = signInData.session?.access_token
    console.log('Created user', user?.id)
    return { id: user?.id, token }
  }

  try {
    const user1 = await signupAndLogin('testuser1')
    const user2 = await signupAndLogin('testuser2')

    // create a post via admin (bypass RLS)
    console.log('Creating post (admin)')
    const postInsert = await supabaseAdmin.from('posts').insert([{ title: rand('post'), content: 'post content' }]).select()
    if (postInsert.error) { console.error('Failed to create post', postInsert.error); process.exit(1) }
    const postId = postInsert.data?.[0]?.id
    console.log('Post created', postId)
    let r

    // create a comment as user1 (set author_id)
    console.log('Creating comment as user1 (admin insert)')
    const commentInsert = await supabaseAdmin.from('comments').insert([{ post_id: postId, content: 'hello comment', user_id: user1.id }]).select()
    if (commentInsert.error) { console.error('Failed to create comment', commentInsert.error); process.exit(1) }
    const comment = commentInsert.data?.[0]
    if (!comment) { console.error('Failed to create comment', commentInsert); process.exit(1) }
    console.log('Comment created', comment.id)

    // try edit as user1 (should succeed)
    console.log('Editing comment as owner (should succeed)')
    r = await fetch('http://localhost:3000/api/comments', { method: 'PUT', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${user1.token}` }, body: JSON.stringify({ id: comment.id, content: 'edited by owner' }) })
    console.log('Owner edit status', r.status)
    console.log(await r.text())

    // try edit as user2 (should be forbidden)
    console.log('Editing comment as non-owner (should 403)')
    r = await fetch('http://localhost:3000/api/comments', { method: 'PUT', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${user2.token}` }, body: JSON.stringify({ id: comment.id, content: 'edited by other' }) })
    console.log('Other edit status', r.status)
    console.log(await r.text())

    // try delete as user2 (should be forbidden)
    console.log('Deleting comment as non-owner (should 403)')
    r = await fetch('http://localhost:3000/api/comments', { method: 'DELETE', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${user2.token}` }, body: JSON.stringify({ id: comment.id }) })
    console.log('Other delete status', r.status)
    console.log(await r.text())

    // delete as owner (should succeed)
    console.log('Deleting comment as owner (should succeed)')
    r = await fetch('http://localhost:3000/api/comments', { method: 'DELETE', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${user1.token}` }, body: JSON.stringify({ id: comment.id }) })
    console.log('Owner delete status', r.status)
    console.log(await r.text())

    // LANDLORD REVIEW flow: insert report with review user1
    if (!service) {
      console.warn('No SUPABASE_SERVICE_ROLE_KEY; skipping landlord report tests')
      process.exit(0)
    }
    console.log('Inserting landlord report with a review by user1 (admin)')
    const admin = supabaseAdmin
    const reportId = 'test-' + Date.now()
    const reviewId = 'rev-' + Date.now()
    const reviewObj = { id: reviewId, nickname: 'tester', content: 'orig review', user_id: user1.id, rating: 5, date: new Date().toISOString().split('T')[0], helpful: 0, unhelpful: 0 }
    const insert = await admin.from('landlord_reports').insert([{ id: reportId, address: 'addr-' + Date.now(), rating: 5, total_reviews:1, reviews: [reviewObj] }]).select()
    if (insert.error) { console.error('Insert landlord report failed', insert.error); process.exit(1) }
    console.log('Inserted report', reportId)

    // edit review as owner
    console.log('Editing landlord review as owner (should succeed)')
    r = await fetch('http://localhost:3000/api/landlord-report/review', { method: 'PUT', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${user1.token}` }, body: JSON.stringify({ id: reviewId, content: 'edited review owner' }) })
    console.log('Owner edit status', r.status)
    console.log(await r.text())

    // edit review as other (should be forbidden)
    console.log('Editing landlord review as non-owner (should 403)')
    r = await fetch('http://localhost:3000/api/landlord-report/review', { method: 'PUT', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${user2.token}` }, body: JSON.stringify({ id: reviewId, content: 'hacked' }) })
    console.log('Other edit status', r.status)
    console.log(await r.text())

    // delete review as owner
    console.log('Deleting landlord review as owner (should succeed)')
    r = await fetch('http://localhost:3000/api/landlord-report/review', { method: 'DELETE', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${user1.token}` }, body: JSON.stringify({ id: reviewId }) })
    console.log('Owner delete status', r.status)
    console.log(await r.text())

    console.log('\nALL TESTS COMPLETED')
  } catch (e) {
    console.error('Test failed', e)
    process.exit(1)
  }
})();
