public class hcfRec {
    public static void main(String[] args) {
     
        int a = 12;
        int b = 15;
        System.out.println(hcf(a, b));
       
    }
    // public static int hcf(int a, int b) {
    //     for(int i=Math.min(a,b);i>0;i--){
    //         if(a%i==0 && b%i==0) return i;
    //     }
    //     return 1;

    public static int hcf(int a, int b) {
        if(b==0) return a;
        return hcf(b, a%b);
    }

   


    

}
