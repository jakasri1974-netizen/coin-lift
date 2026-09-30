import Agreement from '../models/Agreement.js';
import Collaboration from '../models/Collaboration.js';
import Campaign from '../models/Campaign.js';
import User from '../models/User.js';
import { getIsConnected } from '../config/db.js';
import { memoryStore } from '../utils/memoryStore.js';
import { createAndEmitNotification, getIO } from '../sockets/socketServer.js';

/**
 * Ensures an agreement exists for a collaboration (auto-creates if missing)
 */
export const ensureAgreementExists = async ({ collaborationId, campaignId, creatorId, projectId, title, budget, deliverables }) => {
  try {
    const colId = collaborationId.toString();
    const campId = campaignId.toString();
    const cId = creatorId.toString();
    const pId = projectId.toString();

    if (getIsConnected()) {
      let agreement = await Agreement.findOne({ collaborationId: colId });
      if (!agreement) {
        const campaignDoc = await Campaign.findById(campId);
        const campTitle = campaignDoc?.title || 'Web3 Campaign';

        // Parse initial deliverables array
        const initialDeliverables = Array.isArray(deliverables) && deliverables.length > 0
          ? deliverables.map(d => (typeof d === 'string' ? { description: d, type: 'custom', quantity: 1, platform: 'General' } : d))
          : [{ type: 'custom', description: 'Promotional Content Review', quantity: 1, platform: 'General' }];

        // Parse numeric budget
        let parsedBudget = 0;
        if (typeof budget === 'number') parsedBudget = budget;
        else if (typeof budget === 'string') {
          const match = budget.match(/\d+[\d,]*/);
          if (match) parsedBudget = parseFloat(match[0].replace(/,/g, ''));
        }

        agreement = await Agreement.create({
          collaborationId: colId,
          campaignId: campId,
          projectId: pId,
          creatorId: cId,
          title: title || `${campTitle} Agreement`,
          description: `Digital collaboration terms for "${campTitle}"`,
          deliverables: initialDeliverables,
          quantity: initialDeliverables.reduce((acc, curr) => acc + (curr.quantity || 1), 0),
          budget: parsedBudget || 1000,
          currency: 'USDC',
          status: 'pending_creator',
          createdBy: pId,
          version: 1,
        });
      }
      return agreement;
    } else {
      let agreement = memoryStore.agreements.find(a => a.collaborationId.toString() === colId);
      if (!agreement) {
        const camp = memoryStore.campaigns.find(c => c._id.toString() === campId);
        agreement = {
          _id: `agrm_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
          collaborationId: colId,
          campaignId: campId,
          projectId: pId,
          creatorId: cId,
          title: title || `${camp?.title || 'Web3 Campaign'} Agreement`,
          description: `Digital collaboration terms for "${camp?.title || 'Web3 Campaign'}"`,
          deliverables: [
            { _id: `del_${Date.now()}`, type: 'custom', description: 'Promotional Content Review', quantity: 1, platform: 'General' }
          ],
          quantity: 1,
          deadline: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(),
          budget: 1000,
          currency: 'USDC',
          paymentTerms: 'Payment released upon deliverable completion and approval.',
          contentRights: 'Project is granted non-exclusive promotional distribution rights across official channels for 90 days.',
          revisionTerms: 'Up to 2 revision rounds included for compliance and brand accuracy.',
          cancellationTerms: 'Either party may request cancellation before content submission with written notice.',
          additionalTerms: 'This agreement records the terms accepted by both parties. Users are responsible for ensuring terms suit their jurisdiction.',
          status: 'pending_creator',
          creatorAccepted: false,
          projectAccepted: false,
          creatorAcceptedAt: null,
          projectAcceptedAt: null,
          createdBy: pId,
          version: 1,
          previousVersionId: null,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
        memoryStore.agreements.push(agreement);
      }
      return agreement;
    }
  } catch (err) {
    console.error('[Agreement Error] Failed to ensure agreement exists:', err);
    return null;
  }
};

// @desc    Create a new Agreement
// @route   POST /api/agreements
// @access  Private
export const createAgreement = async (req, res, next) => {
  try {
    const {
      collaborationId,
      title,
      description,
      deliverables,
      quantity,
      deadline,
      budget,
      currency,
      paymentTerms,
      contentRights,
      revisionTerms,
      cancellationTerms,
      additionalTerms,
    } = req.body;

    if (!collaborationId) {
      return res.status(400).json({ success: false, message: 'collaborationId is required' });
    }

    if (!title || typeof title !== 'string' || title.trim().length === 0) {
      return res.status(400).json({ success: false, message: 'Agreement title is required' });
    }

    const numericBudget = Number(budget);
    if (isNaN(numericBudget) || numericBudget < 0) {
      return res.status(400).json({ success: false, message: 'Budget must be a numeric value greater than or equal to 0' });
    }

    if (deadline && isNaN(new Date(deadline).getTime())) {
      return res.status(400).json({ success: false, message: 'Invalid deadline date' });
    }

    if (deliverables && Array.isArray(deliverables)) {
      for (const d of deliverables) {
        if (!d.description || typeof d.description !== 'string' || d.description.trim().length === 0) {
          return res.status(400).json({ success: false, message: 'Each deliverable must have a valid description' });
        }
        if (d.quantity !== undefined && (isNaN(Number(d.quantity)) || Number(d.quantity) < 1)) {
          return res.status(400).json({ success: false, message: 'Deliverable quantity must be at least 1' });
        }
      }
    }

    const userId = req.user._id.toString();

    if (getIsConnected()) {
      const collaboration = await Collaboration.findById(collaborationId);
      if (!collaboration) {
        return res.status(404).json({ success: false, message: 'Collaboration not found' });
      }

      const isParticipant =
        req.user.role === 'admin' ||
        collaboration.creatorId.toString() === userId ||
        collaboration.projectId.toString() === userId;

      if (!isParticipant) {
        return res.status(403).json({ success: false, message: 'Forbidden. You are not a participant in this collaboration.' });
      }

      const existing = await Agreement.findOne({ collaborationId, status: { $ne: 'cancelled' } });
      if (existing) {
        return res.status(409).json({
          success: false,
          message: 'An agreement already exists for this collaboration.',
          data: existing,
        });
      }

      const formattedDeliverables = Array.isArray(deliverables) && deliverables.length > 0
        ? deliverables.map(d => ({
            type: d.type || 'custom',
            description: d.description.trim(),
            quantity: Number(d.quantity) || 1,
            dueDate: d.dueDate ? new Date(d.dueDate) : null,
            platform: d.platform || 'General',
          }))
        : [{ type: 'custom', description: 'Promotional Content Review', quantity: 1, platform: 'General' }];

      const agreement = await Agreement.create({
        collaborationId: collaboration._id,
        campaignId: collaboration.campaignId,
        projectId: collaboration.projectId,
        creatorId: collaboration.creatorId,
        title: title.trim(),
        description: description ? description.trim() : '',
        deliverables: formattedDeliverables,
        quantity: Number(quantity) || formattedDeliverables.reduce((acc, curr) => acc + curr.quantity, 0),
        deadline: deadline ? new Date(deadline) : null,
        budget: numericBudget,
        currency: currency || 'USDC',
        paymentTerms: paymentTerms || 'Payment released upon deliverable completion and approval.',
        contentRights: contentRights || 'Project is granted non-exclusive promotional distribution rights.',
        revisionTerms: revisionTerms || 'Up to 2 revision rounds included for compliance.',
        cancellationTerms: cancellationTerms || 'Either party may request cancellation before submission.',
        additionalTerms: additionalTerms || 'This agreement records the terms accepted by both parties.',
        status: req.user.role === 'creator' ? 'pending_project' : 'pending_creator',
        createdBy: req.user._id,
        version: 1,
      });

      const recipientId = collaboration.creatorId.toString() === userId
        ? collaboration.projectId.toString()
        : collaboration.creatorId.toString();

      await createAndEmitNotification({
        recipientId,
        type: 'agreement:created',
        title: 'New Collaboration Agreement',
        message: `${req.user.name || 'Partner'} created a collaboration agreement: "${agreement.title}"`,
        relatedId: agreement._id,
        relatedType: 'Agreement',
        extraData: { agreementId: agreement._id, collaborationId: agreement.collaborationId },
      });

      const io = getIO();
      if (io) {
        io.to(`conversation:${collaboration._id.toString()}`).emit('agreement:created', agreement);
      }

      return res.status(201).json({ success: true, message: 'Agreement created successfully', data: agreement });
    } else {
      const collab = memoryStore.collaborations.find(c => c._id.toString() === collaborationId.toString());
      if (!collab) {
        return res.status(404).json({ success: false, message: 'Collaboration not found' });
      }

      const isParticipant =
        req.user.role === 'admin' ||
        collab.creatorId.toString() === userId ||
        collab.projectId.toString() === userId;

      if (!isParticipant) {
        return res.status(403).json({ success: false, message: 'Forbidden. You are not a participant in this collaboration.' });
      }

      const existing = memoryStore.agreements.find(
        a => a.collaborationId.toString() === collaborationId.toString() && a.status !== 'cancelled'
      );
      if (existing) {
        return res.status(409).json({
          success: false,
          message: 'An agreement already exists for this collaboration.',
          data: existing,
        });
      }

      const agreement = {
        _id: `agrm_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
        collaborationId: collab._id,
        campaignId: collab.campaignId,
        projectId: collab.projectId,
        creatorId: collab.creatorId,
        title: title.trim(),
        description: description ? description.trim() : '',
        deliverables: deliverables || [{ type: 'custom', description: 'Promotional Content Review', quantity: 1, platform: 'General' }],
        quantity: Number(quantity) || 1,
        deadline: deadline || null,
        budget: numericBudget,
        currency: currency || 'USDC',
        paymentTerms: paymentTerms || 'Payment released upon deliverable completion and approval.',
        contentRights: contentRights || 'Project is granted non-exclusive promotional distribution rights.',
        revisionTerms: revisionTerms || 'Up to 2 revision rounds included for compliance.',
        cancellationTerms: cancellationTerms || 'Either party may request cancellation before submission.',
        additionalTerms: additionalTerms || 'This agreement records the terms accepted by both parties.',
        status: req.user.role === 'creator' ? 'pending_project' : 'pending_creator',
        creatorAccepted: false,
        projectAccepted: false,
        creatorAcceptedAt: null,
        projectAcceptedAt: null,
        createdBy: userId,
        version: 1,
        previousVersionId: null,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      memoryStore.agreements.push(agreement);

      const recipientId = collab.creatorId.toString() === userId ? collab.projectId.toString() : collab.creatorId.toString();
      await createAndEmitNotification({
        recipientId,
        type: 'agreement:created',
        title: 'New Collaboration Agreement',
        message: `${req.user.name || 'Partner'} created a collaboration agreement: "${agreement.title}"`,
        relatedId: agreement._id,
        relatedType: 'Agreement',
        extraData: { agreementId: agreement._id, collaborationId: agreement.collaborationId },
      });

      return res.status(201).json({ success: true, message: 'Agreement created successfully', data: agreement });
    }
  } catch (error) {
    next(error);
  }
};

// @desc    Get user agreements with search & pagination
// @route   GET /api/agreements
// @access  Private
export const getAgreements = async (req, res, next) => {
  try {
    const userId = req.user._id.toString();
    const { status, search = '', page = 1, limit = 30 } = req.query;
    const pageNum = Math.max(1, parseInt(page, 10) || 1);
    const limitNum = Math.max(1, Math.min(100, parseInt(limit, 10) || 30));
    const skip = (pageNum - 1) * limitNum;

    if (getIsConnected()) {
      let query = {
        $or: [{ creatorId: userId }, { projectId: userId }],
      };

      if (status && status !== 'all') {
        query.status = status;
      }

      let agreements = await Agreement.find(query)
        .populate('collaborationId')
        .populate('campaignId', 'title category budget deliverables logoColor')
        .populate('creatorId', 'name email profileImage')
        .populate('projectId', 'name email profileImage')
        .sort('-updatedAt')
        .lean();

      if (search.trim()) {
        const term = search.toLowerCase().trim();
        agreements = agreements.filter(a =>
          (a.title && a.title.toLowerCase().includes(term)) ||
          (a.campaignId?.title && a.campaignId.title.toLowerCase().includes(term)) ||
          (a.creatorId?.name && a.creatorId.name.toLowerCase().includes(term)) ||
          (a.projectId?.name && a.projectId.name.toLowerCase().includes(term))
        );
      }

      const total = agreements.length;
      const paginated = agreements.slice(skip, skip + limitNum);

      return res.json({
        success: true,
        count: paginated.length,
        total,
        page: pageNum,
        totalPages: Math.ceil(total / limitNum) || 1,
        data: paginated,
      });
    } else {
      let userAgreements = memoryStore.agreements.filter(a =>
        a.creatorId.toString() === userId || a.projectId.toString() === userId
      );

      if (status && status !== 'all') {
        userAgreements = userAgreements.filter(a => a.status === status);
      }

      let formatted = userAgreements.map(a => {
        const collab = memoryStore.collaborations.find(c => c._id.toString() === a.collaborationId.toString());
        const camp = memoryStore.campaigns.find(c => c._id.toString() === (a.campaignId || '').toString());
        const creator = memoryStore.users.find(u => u._id.toString() === a.creatorId.toString());
        const project = memoryStore.users.find(u => u._id.toString() === a.projectId.toString());

        return {
          ...a,
          collaborationId: collab || a.collaborationId,
          campaignId: camp ? { _id: camp._id, title: camp.title } : a.campaignId,
          creatorId: creator ? { _id: creator._id, name: creator.name, email: creator.email } : a.creatorId,
          projectId: project ? { _id: project._id, name: project.name, email: project.email } : a.projectId,
        };
      });

      if (search.trim()) {
        const term = search.toLowerCase().trim();
        formatted = formatted.filter(a =>
          (a.title && a.title.toLowerCase().includes(term)) ||
          (a.campaignId?.title && a.campaignId.title.toLowerCase().includes(term)) ||
          (a.creatorId?.name && a.creatorId.name.toLowerCase().includes(term)) ||
          (a.projectId?.name && a.projectId.name.toLowerCase().includes(term))
        );
      }

      const total = formatted.length;
      const paginated = formatted.slice(skip, skip + limitNum);

      return res.json({
        success: true,
        count: paginated.length,
        total,
        page: pageNum,
        totalPages: Math.ceil(total / limitNum) || 1,
        data: paginated,
      });
    }
  } catch (error) {
    next(error);
  }
};

// @desc    Get agreement details by ID
// @route   GET /api/agreements/:id
// @access  Private
export const getAgreementById = async (req, res, next) => {
  try {
    const agreementId = req.params.id;
    const userId = req.user._id.toString();

    if (getIsConnected()) {
      let agreement = await Agreement.findById(agreementId)
        .populate('collaborationId')
        .populate('campaignId', 'title category budget deliverables logoColor')
        .populate('creatorId', 'name email profileImage')
        .populate('projectId', 'name email profileImage')
        .populate('createdBy', 'name email role');

      if (!agreement) {
        // Fallback search by collaborationId
        agreement = await Agreement.findOne({ collaborationId: agreementId })
          .populate('collaborationId')
          .populate('campaignId', 'title category budget deliverables logoColor')
          .populate('creatorId', 'name email profileImage')
          .populate('projectId', 'name email profileImage')
          .populate('createdBy', 'name email role');
      }

      if (!agreement) {
        return res.status(404).json({ success: false, message: 'Agreement not found' });
      }

      const isParticipant =
        req.user.role === 'admin' ||
        agreement.creatorId._id.toString() === userId ||
        agreement.projectId._id.toString() === userId;

      if (!isParticipant) {
        return res.status(403).json({ success: false, message: 'Forbidden. You are not a participant in this agreement.' });
      }

      return res.json({ success: true, data: agreement });
    } else {
      let a = memoryStore.agreements.find(
        ag => ag._id.toString() === agreementId.toString() || ag.collaborationId.toString() === agreementId.toString()
      );

      if (!a) {
        return res.status(404).json({ success: false, message: 'Agreement not found' });
      }

      const isParticipant =
        req.user.role === 'admin' ||
        a.creatorId.toString() === userId ||
        a.projectId.toString() === userId;

      if (!isParticipant) {
        return res.status(403).json({ success: false, message: 'Forbidden. You are not a participant in this agreement.' });
      }

      const collab = memoryStore.collaborations.find(c => c._id.toString() === a.collaborationId.toString());
      const camp = memoryStore.campaigns.find(c => c._id.toString() === (a.campaignId || '').toString());
      const creator = memoryStore.users.find(u => u._id.toString() === a.creatorId.toString());
      const project = memoryStore.users.find(u => u._id.toString() === a.projectId.toString());

      const formatted = {
        ...a,
        collaborationId: collab || a.collaborationId,
        campaignId: camp ? { _id: camp._id, title: camp.title } : a.campaignId,
        creatorId: creator ? { _id: creator._id, name: creator.name, email: creator.email } : a.creatorId,
        projectId: project ? { _id: project._id, name: project.name, email: project.email } : a.projectId,
      };

      return res.json({ success: true, data: formatted });
    }
  } catch (error) {
    next(error);
  }
};

// @desc    Update agreement terms (With Versioning Reset on Accepted/Active state)
// @route   PUT /api/agreements/:id
// @access  Private
export const updateAgreement = async (req, res, next) => {
  try {
    const agreementId = req.params.id;
    const userId = req.user._id.toString();
    const {
      title,
      description,
      deliverables,
      quantity,
      deadline,
      budget,
      currency,
      paymentTerms,
      contentRights,
      revisionTerms,
      cancellationTerms,
      additionalTerms,
    } = req.body;

    if (budget !== undefined) {
      const numB = Number(budget);
      if (isNaN(numB) || numB < 0) {
        return res.status(400).json({ success: false, message: 'Budget must be a numeric value >= 0' });
      }
    }

    if (deadline && isNaN(new Date(deadline).getTime())) {
      return res.status(400).json({ success: false, message: 'Invalid deadline date' });
    }

    if (deliverables && Array.isArray(deliverables)) {
      for (const d of deliverables) {
        if (!d.description || typeof d.description !== 'string' || d.description.trim().length === 0) {
          return res.status(400).json({ success: false, message: 'Each deliverable must have a valid description' });
        }
        if (d.quantity !== undefined && (isNaN(Number(d.quantity)) || Number(d.quantity) < 1)) {
          return res.status(400).json({ success: false, message: 'Deliverable quantity must be at least 1' });
        }
      }
    }

    if (getIsConnected()) {
      let agreement = await Agreement.findById(agreementId);
      if (!agreement) return res.status(404).json({ success: false, message: 'Agreement not found' });

      const isParticipant =
        req.user.role === 'admin' ||
        agreement.creatorId.toString() === userId ||
        agreement.projectId.toString() === userId;

      if (!isParticipant) {
        return res.status(403).json({ success: false, message: 'Forbidden. You are not a participant in this agreement.' });
      }

      if (['rejected', 'cancelled', 'completed'].includes(agreement.status)) {
        return res.status(409).json({ success: false, message: `Cannot modify an agreement in '${agreement.status}' status.` });
      }

      // Important terms modified after active or accepted state resets acceptances & increments version
      const wasAcceptedOrActive = agreement.creatorAccepted || agreement.projectAccepted || agreement.status === 'active';

      if (title !== undefined) agreement.title = title.trim();
      if (description !== undefined) agreement.description = description.trim();
      if (deliverables && Array.isArray(deliverables)) {
        agreement.deliverables = deliverables.map(d => ({
          type: d.type || 'custom',
          description: d.description.trim(),
          quantity: Number(d.quantity) || 1,
          dueDate: d.dueDate ? new Date(d.dueDate) : null,
          platform: d.platform || 'General',
        }));
      }
      if (quantity !== undefined) agreement.quantity = Number(quantity);
      if (deadline !== undefined) agreement.deadline = deadline ? new Date(deadline) : null;
      if (budget !== undefined) agreement.budget = Number(budget);
      if (currency !== undefined) agreement.currency = currency;
      if (paymentTerms !== undefined) agreement.paymentTerms = paymentTerms;
      if (contentRights !== undefined) agreement.contentRights = contentRights;
      if (revisionTerms !== undefined) agreement.revisionTerms = revisionTerms;
      if (cancellationTerms !== undefined) agreement.cancellationTerms = cancellationTerms;
      if (additionalTerms !== undefined) agreement.additionalTerms = additionalTerms;

      if (wasAcceptedOrActive) {
        agreement.previousVersionId = agreement._id;
        agreement.version = (agreement.version || 1) + 1;
        agreement.creatorAccepted = false;
        agreement.projectAccepted = false;
        agreement.creatorAcceptedAt = null;
        agreement.projectAcceptedAt = null;
        agreement.status = req.user._id.toString() === agreement.creatorId.toString() ? 'pending_project' : 'pending_creator';
      }

      await agreement.save();

      const updated = await Agreement.findById(agreement._id)
        .populate('collaborationId')
        .populate('campaignId', 'title category budget deliverables logoColor')
        .populate('creatorId', 'name email profileImage')
        .populate('projectId', 'name email profileImage');

      const recipientId = agreement.creatorId.toString() === userId
        ? agreement.projectId.toString()
        : agreement.creatorId.toString();

      await createAndEmitNotification({
        recipientId,
        type: 'agreement:updated',
        title: 'Agreement Terms Updated',
        message: `${req.user.name || 'Partner'} updated agreement terms for "${agreement.title}" (Version ${agreement.version})`,
        relatedId: agreement._id,
        relatedType: 'Agreement',
        extraData: { agreementId: agreement._id, version: agreement.version },
      });

      const io = getIO();
      if (io) {
        io.to(`conversation:${agreement.collaborationId.toString()}`).emit('agreement:updated', updated);
      }

      return res.json({
        success: true,
        message: wasAcceptedOrActive
          ? `Agreement updated to Version ${agreement.version}. Acceptance states reset for partner review.`
          : 'Agreement terms updated successfully',
        data: updated,
      });
    } else {
      let a = memoryStore.agreements.find(ag => ag._id.toString() === agreementId.toString());
      if (!a) return res.status(404).json({ success: false, message: 'Agreement not found' });

      const isParticipant =
        req.user.role === 'admin' ||
        a.creatorId.toString() === userId ||
        a.projectId.toString() === userId;

      if (!isParticipant) {
        return res.status(403).json({ success: false, message: 'Forbidden. You are not a participant in this agreement.' });
      }

      if (['rejected', 'cancelled', 'completed'].includes(a.status)) {
        return res.status(409).json({ success: false, message: `Cannot modify an agreement in '${a.status}' status.` });
      }

      const wasAcceptedOrActive = a.creatorAccepted || a.projectAccepted || a.status === 'active';

      if (title !== undefined) a.title = title.trim();
      if (description !== undefined) a.description = description.trim();
      if (deliverables && Array.isArray(deliverables)) a.deliverables = deliverables;
      if (quantity !== undefined) a.quantity = Number(quantity);
      if (deadline !== undefined) a.deadline = deadline;
      if (budget !== undefined) a.budget = Number(budget);
      if (currency !== undefined) a.currency = currency;
      if (paymentTerms !== undefined) a.paymentTerms = paymentTerms;
      if (contentRights !== undefined) a.contentRights = contentRights;
      if (revisionTerms !== undefined) a.revisionTerms = revisionTerms;
      if (cancellationTerms !== undefined) a.cancellationTerms = cancellationTerms;
      if (additionalTerms !== undefined) a.additionalTerms = additionalTerms;

      if (wasAcceptedOrActive) {
        a.previousVersionId = a._id;
        a.version = (a.version || 1) + 1;
        a.creatorAccepted = false;
        a.projectAccepted = false;
        a.creatorAcceptedAt = null;
        a.projectAcceptedAt = null;
        a.status = userId === a.creatorId.toString() ? 'pending_project' : 'pending_creator';
      }
      a.updatedAt = new Date().toISOString();

      const recipientId = a.creatorId.toString() === userId ? a.projectId.toString() : a.creatorId.toString();
      await createAndEmitNotification({
        recipientId,
        type: 'agreement:updated',
        title: 'Agreement Terms Updated',
        message: `${req.user.name || 'Partner'} updated agreement terms for "${a.title}" (Version ${a.version})`,
        relatedId: a._id,
        relatedType: 'Agreement',
        extraData: { agreementId: a._id, version: a.version },
      });

      return res.json({ success: true, message: 'Agreement terms updated successfully', data: a });
    }
  } catch (error) {
    next(error);
  }
};

// @desc    Accept agreement terms
// @route   PUT /api/agreements/:id/accept
// @access  Private
export const acceptAgreement = async (req, res, next) => {
  try {
    const agreementId = req.params.id;
    const userId = req.user._id.toString();

    if (getIsConnected()) {
      let agreement = await Agreement.findById(agreementId);
      if (!agreement) return res.status(404).json({ success: false, message: 'Agreement not found' });

      const isCreator = agreement.creatorId.toString() === userId;
      const isProject = agreement.projectId.toString() === userId;
      const isAdmin = req.user.role === 'admin';

      if (!isCreator && !isProject && !isAdmin) {
        return res.status(403).json({ success: false, message: 'Forbidden. You are not a participant in this agreement.' });
      }

      // Security check: Prevent user from setting target for other role
      if (isCreator) {
        agreement.creatorAccepted = true;
        agreement.creatorAcceptedAt = new Date();
      } else if (isProject) {
        agreement.projectAccepted = true;
        agreement.projectAcceptedAt = new Date();
      } else if (isAdmin) {
        agreement.creatorAccepted = true;
        agreement.creatorAcceptedAt = new Date();
        agreement.projectAccepted = true;
        agreement.projectAcceptedAt = new Date();
      }

      let isNowActive = agreement.creatorAccepted && agreement.projectAccepted;
      if (isNowActive) {
        agreement.status = 'active';
      } else {
        agreement.status = isCreator ? 'pending_project' : 'pending_creator';
      }

      await agreement.save();

      const updated = await Agreement.findById(agreement._id)
        .populate('collaborationId')
        .populate('campaignId', 'title category budget deliverables logoColor')
        .populate('creatorId', 'name email profileImage')
        .populate('projectId', 'name email profileImage');

      const recipientId = isCreator ? agreement.projectId.toString() : agreement.creatorId.toString();

      if (isNowActive) {
        const notifPayload = {
          type: 'agreement:activated',
          title: 'Agreement Is Now Active!',
          message: `Collaboration agreement "${agreement.title}" was accepted by both parties and is ACTIVE.`,
          relatedId: agreement._id,
          relatedType: 'Agreement',
          extraData: { agreementId: agreement._id, status: 'active' },
        };
        await createAndEmitNotification({ ...notifPayload, recipientId: agreement.creatorId.toString() });
        await createAndEmitNotification({ ...notifPayload, recipientId: agreement.projectId.toString() });

        const io = getIO();
        if (io) {
          io.to(`conversation:${agreement.collaborationId.toString()}`).emit('agreement:activated', updated);
        }
      } else {
        await createAndEmitNotification({
          recipientId,
          type: 'agreement:accepted',
          title: 'Agreement Accepted by Partner',
          message: `${req.user.name || 'Partner'} accepted agreement terms for "${agreement.title}". Pending your confirmation.`,
          relatedId: agreement._id,
          relatedType: 'Agreement',
          extraData: { agreementId: agreement._id },
        });

        const io = getIO();
        if (io) {
          io.to(`conversation:${agreement.collaborationId.toString()}`).emit('agreement:accepted', updated);
        }
      }

      return res.json({
        success: true,
        message: isNowActive ? 'Agreement is now ACTIVE!' : 'Agreement accepted. Waiting for partner confirmation.',
        data: updated,
      });
    } else {
      let a = memoryStore.agreements.find(ag => ag._id.toString() === agreementId.toString());
      if (!a) return res.status(404).json({ success: false, message: 'Agreement not found' });

      const isCreator = a.creatorId.toString() === userId;
      const isProject = a.projectId.toString() === userId;
      const isAdmin = req.user.role === 'admin';

      if (!isCreator && !isProject && !isAdmin) {
        return res.status(403).json({ success: false, message: 'Forbidden. You are not a participant in this agreement.' });
      }

      if (isCreator) {
        a.creatorAccepted = true;
        a.creatorAcceptedAt = new Date().toISOString();
      } else if (isProject) {
        a.projectAccepted = true;
        a.projectAcceptedAt = new Date().toISOString();
      } else if (isAdmin) {
        a.creatorAccepted = true;
        a.creatorAcceptedAt = new Date().toISOString();
        a.projectAccepted = true;
        a.projectAcceptedAt = new Date().toISOString();
      }

      let isNowActive = a.creatorAccepted && a.projectAccepted;
      if (isNowActive) {
        a.status = 'active';
      } else {
        a.status = isCreator ? 'pending_project' : 'pending_creator';
      }
      a.updatedAt = new Date().toISOString();

      const recipientId = isCreator ? a.projectId.toString() : a.creatorId.toString();

      if (isNowActive) {
        const notifPayload = {
          type: 'agreement:activated',
          title: 'Agreement Is Now Active!',
          message: `Collaboration agreement "${a.title}" was accepted by both parties and is ACTIVE.`,
          relatedId: a._id,
          relatedType: 'Agreement',
          extraData: { agreementId: a._id, status: 'active' },
        };
        await createAndEmitNotification({ ...notifPayload, recipientId: a.creatorId.toString() });
        await createAndEmitNotification({ ...notifPayload, recipientId: a.projectId.toString() });
      } else {
        await createAndEmitNotification({
          recipientId,
          type: 'agreement:accepted',
          title: 'Agreement Accepted by Partner',
          message: `${req.user.name || 'Partner'} accepted agreement terms for "${a.title}". Pending your confirmation.`,
          relatedId: a._id,
          relatedType: 'Agreement',
          extraData: { agreementId: a._id },
        });
      }

      return res.json({
        success: true,
        message: isNowActive ? 'Agreement is now ACTIVE!' : 'Agreement accepted. Waiting for partner confirmation.',
        data: a,
      });
    }
  } catch (error) {
    next(error);
  }
};

// @desc    Reject agreement terms
// @route   PUT /api/agreements/:id/reject
// @access  Private
export const rejectAgreement = async (req, res, next) => {
  try {
    const agreementId = req.params.id;
    const userId = req.user._id.toString();

    if (getIsConnected()) {
      let agreement = await Agreement.findById(agreementId);
      if (!agreement) return res.status(404).json({ success: false, message: 'Agreement not found' });

      const isParticipant =
        req.user.role === 'admin' ||
        agreement.creatorId.toString() === userId ||
        agreement.projectId.toString() === userId;

      if (!isParticipant) {
        return res.status(403).json({ success: false, message: 'Forbidden. You are not a participant in this agreement.' });
      }

      agreement.status = 'rejected';
      agreement.creatorAccepted = false;
      agreement.projectAccepted = false;
      await agreement.save();

      const recipientId = agreement.creatorId.toString() === userId
        ? agreement.projectId.toString()
        : agreement.creatorId.toString();

      await createAndEmitNotification({
        recipientId,
        type: 'agreement:rejected',
        title: 'Agreement Rejected',
        message: `${req.user.name || 'Partner'} rejected the agreement terms for "${agreement.title}".`,
        relatedId: agreement._id,
        relatedType: 'Agreement',
        extraData: { agreementId: agreement._id },
      });

      const io = getIO();
      if (io) {
        io.to(`conversation:${agreement.collaborationId.toString()}`).emit('agreement:rejected', agreement);
      }

      return res.json({ success: true, message: 'Agreement rejected', data: agreement });
    } else {
      let a = memoryStore.agreements.find(ag => ag._id.toString() === agreementId.toString());
      if (!a) return res.status(404).json({ success: false, message: 'Agreement not found' });

      const isParticipant =
        req.user.role === 'admin' ||
        a.creatorId.toString() === userId ||
        a.projectId.toString() === userId;

      if (!isParticipant) {
        return res.status(403).json({ success: false, message: 'Forbidden. You are not a participant in this agreement.' });
      }

      a.status = 'rejected';
      a.creatorAccepted = false;
      a.projectAccepted = false;
      a.updatedAt = new Date().toISOString();

      const recipientId = a.creatorId.toString() === userId ? a.projectId.toString() : a.creatorId.toString();
      await createAndEmitNotification({
        recipientId,
        type: 'agreement:rejected',
        title: 'Agreement Rejected',
        message: `${req.user.name || 'Partner'} rejected the agreement terms for "${a.title}".`,
        relatedId: a._id,
        relatedType: 'Agreement',
        extraData: { agreementId: a._id },
      });

      return res.json({ success: true, message: 'Agreement rejected', data: a });
    }
  } catch (error) {
    next(error);
  }
};

// @desc    Cancel agreement
// @route   PUT /api/agreements/:id/cancel
// @access  Private
export const cancelAgreement = async (req, res, next) => {
  try {
    const agreementId = req.params.id;
    const userId = req.user._id.toString();

    if (getIsConnected()) {
      let agreement = await Agreement.findById(agreementId);
      if (!agreement) return res.status(404).json({ success: false, message: 'Agreement not found' });

      const isParticipant =
        req.user.role === 'admin' ||
        agreement.creatorId.toString() === userId ||
        agreement.projectId.toString() === userId;

      if (!isParticipant) {
        return res.status(403).json({ success: false, message: 'Forbidden. You are not a participant in this agreement.' });
      }

      agreement.status = 'cancelled';
      await agreement.save();

      const recipientId = agreement.creatorId.toString() === userId
        ? agreement.projectId.toString()
        : agreement.creatorId.toString();

      await createAndEmitNotification({
        recipientId,
        type: 'agreement:cancelled',
        title: 'Agreement Cancelled',
        message: `${req.user.name || 'Partner'} cancelled the collaboration agreement for "${agreement.title}".`,
        relatedId: agreement._id,
        relatedType: 'Agreement',
        extraData: { agreementId: agreement._id },
      });

      const io = getIO();
      if (io) {
        io.to(`conversation:${agreement.collaborationId.toString()}`).emit('agreement:cancelled', agreement);
      }

      return res.json({ success: true, message: 'Agreement cancelled successfully', data: agreement });
    } else {
      let a = memoryStore.agreements.find(ag => ag._id.toString() === agreementId.toString());
      if (!a) return res.status(404).json({ success: false, message: 'Agreement not found' });

      const isParticipant =
        req.user.role === 'admin' ||
        a.creatorId.toString() === userId ||
        a.projectId.toString() === userId;

      if (!isParticipant) {
        return res.status(403).json({ success: false, message: 'Forbidden. You are not a participant in this agreement.' });
      }

      a.status = 'cancelled';
      a.updatedAt = new Date().toISOString();

      const recipientId = a.creatorId.toString() === userId ? a.projectId.toString() : a.creatorId.toString();
      await createAndEmitNotification({
        recipientId,
        type: 'agreement:cancelled',
        title: 'Agreement Cancelled',
        message: `${req.user.name || 'Partner'} cancelled the collaboration agreement for "${a.title}".`,
        relatedId: a._id,
        relatedType: 'Agreement',
        extraData: { agreementId: a._id },
      });

      return res.json({ success: true, message: 'Agreement cancelled successfully', data: a });
    }
  } catch (error) {
    next(error);
  }
};
