import java.util.ArrayList;
import java.util.List;


public class ArraysList {

    public static void main(String[] args) {
        ArraysList obj = new ArraysList();
        List<List<Integer>> ans = obj.PascalsTriangle(5);
        for(List<Integer> list:ans){
            for(int ele:list){
                System.out.print(ele+" ");
            }
            System.out.println();
        } 
    }
    public List<List<Integer>> PascalsTriangle(int n) {
        List<List<Integer>> ans = new ArrayList<>();

        for(int i=0;i<n;i++){
            ans.add(new ArrayList<>());
            for(int j=0;j<=i;j++){
                if(j==0 || j==i) ans.get(i).add(1); //arr[i][j]=1
                else{
                    int val = ans.get(i-1).get(j)+ans.get(i-1).get(j-1); //arr[i][j]=arr[i-1][j]+arr[i-1][j-1]
                    ans.get(i).add(val);
                }
            }
        }
        return ans;
    }
}
