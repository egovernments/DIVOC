import {expect} from 'chai'
import {reset, set} from 'mockdate'
import {is24hoursAgo} from "./SyncFacade";

describe('Testing Sync Date', () => {

    const currentDate = '2021-01-20T18:09:12.451Z'

    beforeEach(() => {
        set(currentDate)
    });

    afterEach(() => {
        reset()
    });

    it('return true if given date is 24 hours 1 minutes earlier', () => {
        const date = new Date('2021-01-19T18:08:12.451Z')
        const isNeedToSynced = is24hoursAgo(date)
        expect(isNeedToSynced).to.equal(true)
    })

    it('return false if given date is 23 hours 59 minute earlier', () => {
        const date = new Date('2021-01-19T18:10:12.451Z')
        const isNeedToSynced = is24hoursAgo(date)
        expect(isNeedToSynced).to.equal(false)
    })


    it('return true if given date is 2 days earlier', () => {
        const date = new Date('2021-01-18T18:08:12.451Z')
        const isNeedToSynced = is24hoursAgo(date)
        expect(isNeedToSynced).to.equal(true)
    })

    it('return false if given date is 2 days ahead', () => {
        const date = new Date('2021-01-22T18:08:12.451Z')
        const isNeedToSynced = is24hoursAgo(date)
        expect(isNeedToSynced).to.equal(false)
    })
})
