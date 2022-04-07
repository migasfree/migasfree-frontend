export default function () {
  return {
    isLoading: false,
    currentPageTable: 1,
    server: process.env.MIGASFREE_SERVER || 'http://localhost',
  }
}
