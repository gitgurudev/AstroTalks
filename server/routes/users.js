// File: server/routes/users.js
import express from 'express';
import User from '../models/User.js';

const router = express.Router();

/**
 * Helper — derive Sun sign from DD/MM/YYYY date string.
 * Returns e.g. "Capricorn (Makar Rashi)"
 */
function getSunSign(dob) {
  const [day, month] = dob.split('/').map(Number);

  const signs = [
    { name: 'Capricorn (Makar Rashi)',  end: [19, 1]  },
    { name: 'Aquarius (Kumbh Rashi)',   end: [18, 2]  },
    { name: 'Pisces (Meen Rashi)',      end: [20, 3]  },
    { name: 'Aries (Mesh Rashi)',       end: [19, 4]  },
    { name: 'Taurus (Vrishabh Rashi)',  end: [20, 5]  },
    { name: 'Gemini (Mithun Rashi)',    end: [20, 6]  },
    { name: 'Cancer (Kark Rashi)',      end: [22, 7]  },
    { name: 'Leo (Simha Rashi)',        end: [22, 8]  },
    { name: 'Virgo (Kanya Rashi)',      end: [22, 9]  },
    { name: 'Libra (Tula Rashi)',       end: [22, 10] },
    { name: 'Scorpio (Vrishchik Rashi)',end: [21, 11] },
    { name: 'Sagittarius (Dhanu Rashi)',end: [21, 12] },
    { name: 'Capricorn (Makar Rashi)',  end: [31, 12] },
  ];

  for (const sign of signs) {
    const [endDay, endMonth] = sign.end;
    if (month < endMonth || (month === endMonth && day <= endDay)) {
      return sign.name;
    }
  }
  return 'Capricorn (Makar Rashi)';
}

/**
 * Helper — approximate Nakshatra from DOB.
 * Based on Sun's approximate position (simplified).
 */
function getNakshatra(dob) {
  const [day, month] = dob.split('/').map(Number);
  // Day of year (approximate)
  const daysInMonth = [0,31,28,31,30,31,30,31,31,30,31,30,31];
  let dayOfYear = day;
  for (let m = 1; m < month; m++) dayOfYear += daysInMonth[m];

  const nakshatras = [
    'Ashwini','Bharani','Krittika','Rohini','Mrigashira',
    'Ardra','Punarvasu','Pushya','Ashlesha','Magha',
    'Purva Phalguni','Uttara Phalguni','Hasta','Chitra','Swati',
    'Vishakha','Anuradha','Jyeshtha','Mula','Purva Ashadha',
    'Uttara Ashadha','Shravana','Dhanishtha','Shatabhisha',
    'Purva Bhadrapada','Uttara Bhadrapada','Revati',
  ];

  // Each Nakshatra spans ~13.33 days; 27 Nakshatras in 365 days
  const index = Math.floor((dayOfYear / 365) * 27) % 27;
  return nakshatras[index];
}

// ── POST /api/users  — create or find existing user by name + dob ──
router.post('/', async (req, res) => {
  try {
    const { name, dob } = req.body;

    if (!name || !dob) {
      return res.status(400).json({ error: 'Name and DOB are required.' });
    }

    // Validate DD/MM/YYYY format
    const dobRegex = /^\d{2}\/\d{2}\/\d{4}$/;
    if (!dobRegex.test(dob)) {
      return res.status(400).json({ error: 'DOB must be in DD/MM/YYYY format.' });
    }

    // Return existing user if already registered
    let user = await User.findOne({ name: name.trim(), dob });
    if (!user) {
      user = await User.create({
        name: name.trim(),
        dob,
        sunSign: getSunSign(dob),
        nakshatra: getNakshatra(dob),
      });
    }

    res.status(201).json(user);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ── GET /api/users/:id ──
router.get('/:id', async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ error: 'User not found.' });
    res.json(user);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
