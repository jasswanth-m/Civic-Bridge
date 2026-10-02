const supabase = require('../config/supabase');
const fs = require('fs');
const path = require('path');

exports.uploadDocument = async (req, res) => {
  try {
    // 1. Validate auth token
    const authHeader = req.headers.authorization;
    if (!authHeader) return res.status(401).json({ error: 'Missing authorization header' });
    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    
    if (authError || !user) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    const { schemeId, documentName } = req.body;
    const file = req.file;

    // 2. Upload to Supabase Storage
    const fileName = `${user.id}/${Date.now()}_${file.originalname}`;
    const fileBuffer = fs.readFileSync(file.path);
    
    const { data: storageData, error: storageError } = await supabase.storage
      .from('student-documents')
      .upload(fileName, fileBuffer, {
        contentType: file.mimetype,
        upsert: false
      });

    // Cleanup local temp file
    fs.unlinkSync(file.path);

    if (storageError) {
      return res.status(500).json({ error: 'Failed to upload to storage: ' + storageError.message });
    }

    // 3. Insert metadata into student_documents table
    const { data: docData, error: dbError } = await supabase
      .from('student_documents')
      .insert([
        {
          student_id: user.id,
          scheme_id: schemeId || 'general',
          document_name: documentName || file.originalname,
          storage_path: fileName,
          file_type: file.mimetype,
          file_size: file.size,
          status: 'Under Review'
        }
      ])
      .select();

    if (dbError) {
      return res.status(500).json({ error: 'Failed to save document metadata: ' + dbError.message });
    }

    res.status(200).json({ success: true, document: docData[0] });

  } catch (error) {
    console.error("Upload error:", error);
    res.status(500).json({ error: error.message });
  }
};

exports.getDocuments = async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader) return res.status(401).json({ error: 'Missing authorization header' });
    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    
    if (authError || !user) return res.status(401).json({ error: 'Unauthorized' });

    const { data: docs, error: dbError } = await supabase
      .from('student_documents')
      .select('*')
      .eq('student_id', user.id);

    if (dbError) return res.status(500).json({ error: dbError.message });

    res.status(200).json({ documents: docs });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
