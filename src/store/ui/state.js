export default function() {
  return {
    isLoading: false,
    server: process.env.MIGASFREE_SERVER || 'http://localhost'
  }
}
