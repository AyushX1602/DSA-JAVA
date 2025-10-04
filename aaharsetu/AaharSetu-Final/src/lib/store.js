// import { create } from 'zustand';


// export const useStore = create((set) => ({
//     volunteers: [],
//     donations: [],
//     ngos: [],
//     donors: [],
//     donationRequests: [],
//     currentUser: null,
//     addVolunteer: (volunteer) =>
//         set((state) => ({
//             volunteers: [
//                 ...state.volunteers,
//                 {
//                     ...volunteer,
//                     id: crypto.randomUUID(),
//                     completedDeliveries: 0,
//                     rating: 0,
//                     joinedAt: new Date().toISOString()
//                 }
//             ]
//         })),
//     addDonation: (donation) =>
//         set((state) => ({
//             donations: [
//                 ...state.donations,
//                 {
//                     ...donation,
//                     id: crypto.randomUUID(),
//                     status: 'pending',
//                     claimedBy: null,
//                     claimedAt: null,
//                     ngoId: null,
//                     ngoApprovedAt: null
//                 }
//             ]
//         })),
//     updateDonationStatus: (donationId, status, volunteerId = null) =>
//         set((state) => ({
//             donations: state.donations.map((donation) =>
//                 donation.id === donationId
//                     ? {
//                           ...donation,
//                           status,
//                           claimedBy: volunteerId,
//                           claimedAt: status === 'claimed' ? new Date().toISOString() : donation.claimedAt
//                       }
//                     : donation
//             )
//         })),
//     addNGO: (ngo) =>
//         set((state) => ({
//             ngos: [
//                 ...state.ngos,
//                 {
//                     ...ngo,
//                     id: crypto.randomUUID(),
//                     status: 'pending',
//                     createdAt: new Date().toISOString(),
//                     approvedDonations: 0,
//                     rating: 0
//                 }
//             ]
//         })),
//     approveNGODonation: (donationId, ngoId) =>
//         set((state) => ({
//             donations: state.donations.map((donation) =>
//                 donation.id === donationId
//                     ? {
//                           ...donation,
//                           status: 'ngo_approved',
//                           ngoId,
//                           ngoApprovedAt: new Date().toISOString()
//                       }
//                     : donation
//             ),
//             ngos: state.ngos.map((ngo) =>
//                 ngo.id === ngoId ? { ...ngo, approvedDonations: (ngo.approvedDonations || 0) + 1 } : ngo
//             )
//         })),
//     addDonor: (donor) =>
//         set((state) => ({
//             donors: [
//                 ...state.donors,
//                 {
//                     ...donor,
//                     id: crypto.randomUUID(),
//                     totalDonations: 0,
//                     rating: 0,
//                     joinedAt: new Date().toISOString()
//                 }
//             ]
//         })),
//     setCurrentUser: (user) =>
//         set(() => ({
//             currentUser: user
//         })),
//     addDonationRequest: (request) =>
//         set((state) => ({
//             donationRequests: [
//                 ...state.donationRequests,
//                 {
//                     ...request,
//                     id: crypto.randomUUID(),
//                     status: 'pending',
//                     createdAt: new Date().toISOString()
//                 }
//             ]
//         })),
//     acceptDonationRequest: (requestId, donorId) =>
//         set((state) => ({
//             donationRequests: state.donationRequests.map((request) =>
//                 request.id === requestId ? { ...request, status: 'accepted' } : request
//             )
//         }))
// }));
