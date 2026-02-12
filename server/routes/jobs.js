const express = require('express');
const { v4: uuidv4 } = require('uuid');
const { db } = require('../db/init');
const { auth, optionalAuth } = require('../middleware/auth');

const router = express.Router();

// GET /api/jobs/user/applications - Get current user's job applications
// (defined before /:id to avoid route conflict)
router.get('/user/applications', auth, (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const offset = (page - 1) * limit;

    const applications = db.prepare(`
      SELECT ja.*,
        j.title as job_title, j.company as job_company, j.location as job_location,
        j.type as job_type, j.is_active as job_is_active
      FROM job_applications ja
      JOIN jobs j ON ja.job_id = j.id
      WHERE ja.user_id = ?
      ORDER BY ja.created_at DESC
      LIMIT ? OFFSET ?
    `).all(req.user.id, limit, offset);

    const total = db.prepare('SELECT COUNT(*) as count FROM job_applications WHERE user_id = ?').get(req.user.id).count;

    res.json({
      applications,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Get user applications error:', error);
    res.status(500).json({ error: 'Server error fetching applications' });
  }
});

// GET /api/jobs/user/saved - Get saved jobs
// (defined before /:id to avoid route conflict)
router.get('/user/saved', auth, (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const offset = (page - 1) * limit;

    const savedJobs = db.prepare(`
      SELECT sj.id as saved_id, sj.created_at as saved_at,
        j.*,
        u.first_name as poster_first_name, u.last_name as poster_last_name
      FROM saved_jobs sj
      JOIN jobs j ON sj.job_id = j.id
      JOIN users u ON j.posted_by = u.id
      WHERE sj.user_id = ?
      ORDER BY sj.created_at DESC
      LIMIT ? OFFSET ?
    `).all(req.user.id, limit, offset);

    const total = db.prepare('SELECT COUNT(*) as count FROM saved_jobs WHERE user_id = ?').get(req.user.id).count;

    res.json({
      saved_jobs: savedJobs,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Get saved jobs error:', error);
    res.status(500).json({ error: 'Server error fetching saved jobs' });
  }
});

// GET /api/jobs - List jobs with filters and pagination
router.get('/', optionalAuth, (req, res) => {
  try {
    const { q, location, type, experience_level, salary_min } = req.query;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const offset = (page - 1) * limit;

    let conditions = ['j.is_active = 1'];
    let params = [];

    if (q) {
      conditions.push('(j.title LIKE ? OR j.company LIKE ? OR j.description LIKE ? OR j.skills_required LIKE ?)');
      const searchTerm = `%${q}%`;
      params.push(searchTerm, searchTerm, searchTerm, searchTerm);
    }

    if (location) {
      conditions.push('j.location LIKE ?');
      params.push(`%${location}%`);
    }

    if (type) {
      conditions.push('j.type = ?');
      params.push(type);
    }

    if (experience_level) {
      conditions.push('j.experience_level = ?');
      params.push(experience_level);
    }

    if (salary_min) {
      conditions.push('j.salary_max >= ?');
      params.push(parseInt(salary_min));
    }

    const whereClause = conditions.length > 0 ? 'WHERE ' + conditions.join(' AND ') : '';

    const jobs = db.prepare(`
      SELECT j.*,
        u.first_name as poster_first_name, u.last_name as poster_last_name, u.avatar as poster_avatar
      FROM jobs j
      JOIN users u ON j.posted_by = u.id
      ${whereClause}
      ORDER BY j.created_at DESC
      LIMIT ? OFFSET ?
    `).all(...params, limit, offset);

    const totalResult = db.prepare(`
      SELECT COUNT(*) as count FROM jobs j ${whereClause}
    `).get(...params);

    // Add saved status if user is logged in
    const jobsWithStatus = jobs.map(job => {
      let saved = false;
      let applied = false;
      if (req.user) {
        const savedJob = db.prepare('SELECT id FROM saved_jobs WHERE job_id = ? AND user_id = ?').get(job.id, req.user.id);
        saved = !!savedJob;
        const application = db.prepare('SELECT id FROM job_applications WHERE job_id = ? AND user_id = ?').get(job.id, req.user.id);
        applied = !!application;
      }
      return { ...job, saved, applied };
    });

    res.json({
      jobs: jobsWithStatus,
      pagination: {
        page,
        limit,
        total: totalResult.count,
        pages: Math.ceil(totalResult.count / limit)
      }
    });
  } catch (error) {
    console.error('List jobs error:', error);
    res.status(500).json({ error: 'Server error fetching jobs' });
  }
});

// GET /api/jobs/:id - Get job detail
router.get('/:id', optionalAuth, (req, res) => {
  try {
    const { id } = req.params;

    const job = db.prepare(`
      SELECT j.*,
        u.first_name as poster_first_name, u.last_name as poster_last_name,
        u.avatar as poster_avatar, u.headline as poster_headline
      FROM jobs j
      JOIN users u ON j.posted_by = u.id
      WHERE j.id = ?
    `).get(id);

    if (!job) {
      return res.status(404).json({ error: 'Job not found' });
    }

    // Get application count
    const applicationCount = db.prepare('SELECT COUNT(*) as count FROM job_applications WHERE job_id = ?').get(id).count;

    // Check if current user has applied or saved
    let applicationStatus = null;
    let saved = false;

    if (req.user) {
      const application = db.prepare('SELECT id, status FROM job_applications WHERE job_id = ? AND user_id = ?').get(id, req.user.id);
      if (application) {
        applicationStatus = application.status;
      }

      const savedJob = db.prepare('SELECT id FROM saved_jobs WHERE job_id = ? AND user_id = ?').get(id, req.user.id);
      saved = !!savedJob;
    }

    res.json({
      job: {
        ...job,
        application_count: applicationCount,
        application_status: applicationStatus,
        saved
      }
    });
  } catch (error) {
    console.error('Get job error:', error);
    res.status(500).json({ error: 'Server error fetching job' });
  }
});

// POST /api/jobs - Create job posting
router.post('/', auth, (req, res) => {
  try {
    const { company, title, description, location, type, salary_min, salary_max, experience_level, skills_required } = req.body;

    // Validation
    if (!company || !title || !description) {
      return res.status(400).json({ error: 'Company, title, and description are required' });
    }

    const validTypes = ['Full-time', 'Part-time', 'Contract', 'Remote'];
    if (type && !validTypes.includes(type)) {
      return res.status(400).json({ error: 'Invalid job type. Must be one of: ' + validTypes.join(', ') });
    }

    const validLevels = ['Entry', 'Mid', 'Senior', 'Lead'];
    if (experience_level && !validLevels.includes(experience_level)) {
      return res.status(400).json({ error: 'Invalid experience level. Must be one of: ' + validLevels.join(', ') });
    }

    const id = uuidv4();

    db.prepare(`
      INSERT INTO jobs (id, posted_by, company, title, description, location, type, salary_min, salary_max, experience_level, skills_required)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(id, req.user.id, company, title, description, location || null, type || null, salary_min || null, salary_max || null, experience_level || null, skills_required || null);

    const job = db.prepare('SELECT * FROM jobs WHERE id = ?').get(id);

    res.status(201).json({ job });
  } catch (error) {
    console.error('Create job error:', error);
    res.status(500).json({ error: 'Server error creating job' });
  }
});

// PUT /api/jobs/:id - Update own job posting
router.put('/:id', auth, (req, res) => {
  try {
    const { id } = req.params;

    const job = db.prepare('SELECT * FROM jobs WHERE id = ?').get(id);
    if (!job) {
      return res.status(404).json({ error: 'Job not found' });
    }

    if (job.posted_by !== req.user.id) {
      return res.status(403).json({ error: 'Not authorized to update this job' });
    }

    const { company, title, description, location, type, salary_min, salary_max, experience_level, skills_required, is_active } = req.body;

    const updates = [];
    const values = [];

    if (company !== undefined) { updates.push('company = ?'); values.push(company); }
    if (title !== undefined) { updates.push('title = ?'); values.push(title); }
    if (description !== undefined) { updates.push('description = ?'); values.push(description); }
    if (location !== undefined) { updates.push('location = ?'); values.push(location); }
    if (type !== undefined) { updates.push('type = ?'); values.push(type); }
    if (salary_min !== undefined) { updates.push('salary_min = ?'); values.push(salary_min); }
    if (salary_max !== undefined) { updates.push('salary_max = ?'); values.push(salary_max); }
    if (experience_level !== undefined) { updates.push('experience_level = ?'); values.push(experience_level); }
    if (skills_required !== undefined) { updates.push('skills_required = ?'); values.push(skills_required); }
    if (is_active !== undefined) { updates.push('is_active = ?'); values.push(is_active); }

    if (updates.length === 0) {
      return res.status(400).json({ error: 'No fields to update' });
    }

    values.push(id);

    db.prepare(`UPDATE jobs SET ${updates.join(', ')} WHERE id = ?`).run(...values);

    const updatedJob = db.prepare('SELECT * FROM jobs WHERE id = ?').get(id);

    res.json({ job: updatedJob });
  } catch (error) {
    console.error('Update job error:', error);
    res.status(500).json({ error: 'Server error updating job' });
  }
});

// DELETE /api/jobs/:id - Delete own job posting
router.delete('/:id', auth, (req, res) => {
  try {
    const { id } = req.params;

    const job = db.prepare('SELECT * FROM jobs WHERE id = ?').get(id);
    if (!job) {
      return res.status(404).json({ error: 'Job not found' });
    }

    if (job.posted_by !== req.user.id) {
      return res.status(403).json({ error: 'Not authorized to delete this job' });
    }

    // Delete related data
    db.prepare('DELETE FROM job_applications WHERE job_id = ?').run(id);
    db.prepare('DELETE FROM saved_jobs WHERE job_id = ?').run(id);
    db.prepare('DELETE FROM jobs WHERE id = ?').run(id);

    res.json({ message: 'Job deleted successfully' });
  } catch (error) {
    console.error('Delete job error:', error);
    res.status(500).json({ error: 'Server error deleting job' });
  }
});

// POST /api/jobs/:id/apply - Apply to job
router.post('/:id/apply', auth, (req, res) => {
  try {
    const { id } = req.params;
    const { cover_letter } = req.body;

    const job = db.prepare('SELECT * FROM jobs WHERE id = ? AND is_active = 1').get(id);
    if (!job) {
      return res.status(404).json({ error: 'Job not found or no longer active' });
    }

    // Cannot apply to own job
    if (job.posted_by === req.user.id) {
      return res.status(400).json({ error: 'Cannot apply to your own job posting' });
    }

    // Check if already applied
    const existingApplication = db.prepare('SELECT id FROM job_applications WHERE job_id = ? AND user_id = ?').get(id, req.user.id);
    if (existingApplication) {
      return res.status(400).json({ error: 'You have already applied to this job' });
    }

    const applicationId = uuidv4();

    db.prepare(`
      INSERT INTO job_applications (id, job_id, user_id, cover_letter)
      VALUES (?, ?, ?, ?)
    `).run(applicationId, id, req.user.id, cover_letter || null);

    // Create notification for job poster
    const notificationId = uuidv4();
    db.prepare(`
      INSERT INTO notifications (id, user_id, type, reference_id, message)
      VALUES (?, ?, 'job_application', ?, ?)
    `).run(notificationId, job.posted_by, applicationId, `${req.user.first_name} ${req.user.last_name} applied to your job: ${job.title}`);

    const application = db.prepare('SELECT * FROM job_applications WHERE id = ?').get(applicationId);

    res.status(201).json({ application });
  } catch (error) {
    console.error('Apply to job error:', error);
    res.status(500).json({ error: 'Server error applying to job' });
  }
});

// GET /api/jobs/:id/applications - Get applications for own job posting
router.get('/:id/applications', auth, (req, res) => {
  try {
    const { id } = req.params;

    const job = db.prepare('SELECT * FROM jobs WHERE id = ?').get(id);
    if (!job) {
      return res.status(404).json({ error: 'Job not found' });
    }

    if (job.posted_by !== req.user.id) {
      return res.status(403).json({ error: 'Not authorized to view applications for this job' });
    }

    const applications = db.prepare(`
      SELECT ja.*,
        u.first_name, u.last_name, u.email, u.headline, u.avatar,
        u.location as applicant_location, u.experience_years, u.skills
      FROM job_applications ja
      JOIN users u ON ja.user_id = u.id
      WHERE ja.job_id = ?
      ORDER BY ja.created_at DESC
    `).all(id);

    res.json({ applications });
  } catch (error) {
    console.error('Get job applications error:', error);
    res.status(500).json({ error: 'Server error fetching job applications' });
  }
});

// POST /api/jobs/:id/save - Toggle save/unsave job
router.post('/:id/save', auth, (req, res) => {
  try {
    const { id } = req.params;

    const job = db.prepare('SELECT id FROM jobs WHERE id = ?').get(id);
    if (!job) {
      return res.status(404).json({ error: 'Job not found' });
    }

    const existingSave = db.prepare('SELECT id FROM saved_jobs WHERE job_id = ? AND user_id = ?').get(id, req.user.id);

    if (existingSave) {
      // Unsave
      db.prepare('DELETE FROM saved_jobs WHERE id = ?').run(existingSave.id);
      res.json({ saved: false, message: 'Job unsaved' });
    } else {
      // Save
      const saveId = uuidv4();
      db.prepare('INSERT INTO saved_jobs (id, user_id, job_id) VALUES (?, ?, ?)').run(saveId, req.user.id, id);
      res.json({ saved: true, message: 'Job saved' });
    }
  } catch (error) {
    console.error('Toggle save job error:', error);
    res.status(500).json({ error: 'Server error toggling job save' });
  }
});

module.exports = router;
