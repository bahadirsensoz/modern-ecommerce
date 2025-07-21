import express from 'express'
import {
    getRecommendations,
    getPopularProducts,
    getRelatedProducts,
    getRecentlyViewed,
    trackActivity
} from '../controllers/recommendationController'

const router = express.Router()

router.get('/popular', getPopularProducts)
router.get('/related/:productId', getRelatedProducts)
router.get('/recently-viewed', getRecentlyViewed)
router.get('/', getRecommendations)

router.post('/track', trackActivity)

export default router 